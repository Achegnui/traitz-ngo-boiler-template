import { z } from "zod";
import { MAX_AMOUNT, MIN_AMOUNT } from "@/lib/donation-limits";
import { FapshiError, type FapshiClient, type PaymentStatus } from "@/lib/server/fapshi";

/** Donation rules. Everything here is pure logic over a DonationStore and a FapshiClient, so it is tested with fakes. */

export const CURRENCY = "XAF";
export { MAX_AMOUNT, MIN_AMOUNT };
const LOCALES = ["en", "fr"] as const; // keep in step with i18n/routing.ts

export const donationInput = z.object({
  amount: z.number().int().min(MIN_AMOUNT).max(MAX_AMOUNT),
  donorName: z.string().trim().min(1).max(100),
  donorEmail: z.string().trim().toLowerCase().max(200).email(),
  frequency: z.enum(["one-time", "monthly"]),
  // The form sends "" for "general fund".
  programmeId: z.preprocess((v) => (v === "" || v === null ? undefined : v), z.string().trim().max(100).regex(/^[A-Za-z0-9_-]+$/).optional()),
  locale: z.enum(LOCALES),
});
export type DonationInput = z.infer<typeof donationInput>;

export type DonationStatus = "pending" | "completed" | "failed";

/** The /donations/{id} document. createdAt and updatedAt are ISO strings, which is what the admin table reads. */
export type Donation = {
  amount: number;
  currency: typeof CURRENCY;
  donorName: string;
  donorEmail: string;
  frequency: DonationInput["frequency"];
  programmeId: string | null;
  locale: DonationInput["locale"];
  fapshiTransactionId: string | null;
  status: DonationStatus;
  failureReason?: string | null;
  createdAt: string;
  updatedAt: string;
};

export interface DonationStore {
  create(donation: Donation): Promise<string>;
  get(id: string): Promise<Donation | null>;
  findByTransactionId(transId: string): Promise<{ id: string; donation: Donation } | null>;
  /** Atomic read-decide-write. decide returns the fields to change, or null to leave the document alone. */
  transition(id: string, decide: (current: Donation) => Partial<Donation> | null): Promise<Donation | null>;
}

export type DonationDeps = { store: DonationStore; fapshi: FapshiClient; siteUrl: string; now?: () => Date };

export class DonationError extends Error {
  constructor(readonly code: "payment_unavailable") {
    super(code);
    this.name = "DonationError";
  }
}

const stamp = (deps: DonationDeps) => (deps.now ?? (() => new Date()))().toISOString();

export function mapStatus(fapshiStatus: string): DonationStatus {
  switch (fapshiStatus.toUpperCase()) {
    case "SUCCESSFUL": return "completed";
    case "FAILED":
    case "EXPIRED": return "failed";
    default: return "pending"; // CREATED, PENDING, or anything new: never completes by accident
  }
}

/** Saves a pending donation, asks Fapshi for a payment link and returns it. The donation id doubles as Fapshi's externalId. */
export async function startDonation(deps: DonationDeps, input: DonationInput): Promise<{ donationId: string; link: string }> {
  const now = stamp(deps);
  const id = await deps.store.create({
    amount: input.amount,
    currency: CURRENCY,
    donorName: input.donorName,
    donorEmail: input.donorEmail,
    frequency: input.frequency,
    programmeId: input.programmeId ?? null,
    locale: input.locale,
    fapshiTransactionId: null,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  });
  try {
    const { link, transId } = await deps.fapshi.initiatePay({
      amount: input.amount,
      email: input.donorEmail,
      externalId: id,
      redirectUrl: `${deps.siteUrl}/${input.locale}/donate/thank-you?d=${id}`,
      message: "Donation",
    });
    await deps.store.transition(id, () => ({ fapshiTransactionId: transId, updatedAt: stamp(deps) }));
    return { donationId: id, link };
  } catch (e) {
    // Do not leave an orphaned pending record behind.
    const reason = e instanceof FapshiError ? `fapshi_${e.statusCode}` : "initiate_failed";
    await deps.store
      .transition(id, (c) => (c.status === "pending" ? { status: "failed", failureReason: reason, updatedAt: stamp(deps) } : null))
      .catch(() => undefined);
    if (e instanceof FapshiError) throw new DonationError("payment_unavailable");
    throw e;
  }
}

/**
 * Applies a status that was fetched from Fapshi (never one taken from a request body). A completed donation is final,
 * a status for a different transaction is ignored, and a successful payment whose amount differs from the stored
 * amount is not marked completed.
 */
export async function applyPaymentStatus(deps: DonationDeps, id: string, status: PaymentStatus): Promise<Donation | null> {
  const next = mapStatus(status.status);
  return deps.store.transition(id, (cur) => {
    if (cur.status === "completed") return null;
    if (cur.fapshiTransactionId && cur.fapshiTransactionId !== status.transId) return null;
    const patch: Partial<Donation> = {};
    if (!cur.fapshiTransactionId) patch.fapshiTransactionId = status.transId;
    let target: DonationStatus = next;
    let reason: string | undefined;
    if (next === "completed" && status.amount !== null && status.amount !== cur.amount) {
      target = "failed";
      reason = `amount_mismatch_${status.amount}`;
    } else if (next === "failed") {
      reason = `fapshi_${status.status.toLowerCase()}`;
    }
    if (target !== cur.status) {
      patch.status = target;
      if (reason) patch.failureReason = reason;
      else if (cur.failureReason) patch.failureReason = null;
    }
    if (Object.keys(patch).length === 0) return null;
    patch.updatedAt = stamp(deps);
    return patch;
  });
}

export type SettleOutcome = DonationStatus | "unknown" | "mismatch";

/** Webhook path: ask Fapshi what really happened to this transaction, find our donation, apply it. */
export async function settleByTransactionId(deps: DonationDeps, transId: string): Promise<{ outcome: SettleOutcome }> {
  const status = await deps.fapshi.getPaymentStatus(transId);
  let id: string | null = null;
  if (status.externalId) {
    const byId = await deps.store.get(status.externalId);
    if (byId) {
      if (byId.fapshiTransactionId && byId.fapshiTransactionId !== status.transId) return { outcome: "mismatch" };
      id = status.externalId;
    }
  }
  if (!id) id = (await deps.store.findByTransactionId(status.transId))?.id ?? null;
  if (!id) return { outcome: "unknown" };
  const after = await applyPaymentStatus(deps, id, status);
  return { outcome: after?.status ?? "unknown" };
}

export type PublicDonation = { status: DonationStatus; amount: number; currency: string; frequency: Donation["frequency"] };

/** For the thank-you page. Only non-personal fields. A pending donation is re-checked with Fapshi, so it also works when no webhook can reach the server (local testing). */
export async function getDonationStatus(deps: DonationDeps, id: string): Promise<PublicDonation | null> {
  let donation = await deps.store.get(id);
  if (!donation) return null;
  if (donation.status === "pending" && donation.fapshiTransactionId) {
    try {
      const fresh = await deps.fapshi.getPaymentStatus(donation.fapshiTransactionId);
      donation = (await applyPaymentStatus(deps, id, fresh)) ?? donation;
    } catch (e) {
      console.warn(`[donate] status refresh failed for ${id}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  return { status: donation.status, amount: donation.amount, currency: donation.currency, frequency: donation.frequency };
}
