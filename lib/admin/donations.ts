import type { Raw } from "./types";

/** Pure helpers for the admin donations screen, kept apart from React so they can be unit tested. */

export type DonationStatus = "completed" | "pending" | "failed";
export type DonationFilter = "all" | DonationStatus;

export const FILTERS: { id: DonationFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "completed", label: "Completed" },
  { id: "pending", label: "Pending" },
  { id: "failed", label: "Failed" },
];

/** A donor who opens the payment page and closes it leaves a pending record. After a day it is probably abandoned. */
export const STALE_PENDING_MS = 24 * 60 * 60 * 1000;

/** Anything that is not clearly completed or failed is shown as pending, so an unknown value is never counted as money received. */
export const statusOf = (d: Raw): DonationStatus => (d.status === "completed" || d.status === "failed" ? d.status : "pending");

export const sortNewestFirst = (docs: Raw[]): Raw[] =>
  [...docs].sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")));

export const filterDonations = (docs: Raw[], filter: DonationFilter): Raw[] => (filter === "all" ? docs : docs.filter((d) => statusOf(d) === filter));

export const amountOf = (d: Raw): number => {
  const n = Number(d.amount);
  return Number.isFinite(n) ? n : 0;
};

export const formatAmount = (d: Raw): string => `${amountOf(d).toLocaleString("en")} ${d.currency ?? "XAF"}`;

/** Dates are stored as UTC ISO strings. Shown as "2026-10-14 09:30" with the column headed "UTC". */
export const formatWhen = (createdAt: unknown): string => String(createdAt ?? "").slice(0, 16).replace("T", " ");

/** The server marks a successful payment whose amount differs from the pledge as failed with this reason. Money may have arrived. */
export const needsReview = (d: Raw): boolean => statusOf(d) === "failed" && typeof d.failureReason === "string" && d.failureReason.startsWith("amount_mismatch");

export function isStalePending(d: Raw, now: number = Date.now()): boolean {
  if (statusOf(d) !== "pending") return false;
  const created = Date.parse(String(d.createdAt ?? ""));
  return Number.isFinite(created) && now - created > STALE_PENDING_MS;
}

/** Turns the machine reason the server saves (lib/server/donations.ts) into a sentence for staff. */
export function describeFailure(reason: unknown): string | null {
  if (typeof reason !== "string" || !reason) return null;
  if (reason === "fapshi_failed") return "The payment failed or was declined.";
  if (reason === "fapshi_expired") return "The payment link expired before it was paid.";
  if (reason === "initiate_failed") return "The payment could not be started.";
  const started = /^fapshi_(\d{3})$/.exec(reason);
  if (started) return `The payment could not be started (Fapshi error ${started[1]}).`;
  const mismatch = /^amount_mismatch_(\d+(?:\.\d+)?)$/.exec(reason);
  if (mismatch) return `Fapshi reports ${Number(mismatch[1]).toLocaleString("en")} XAF paid, which differs from the amount pledged. Check the Fapshi dashboard.`;
  if (reason.startsWith("amount_mismatch")) return "The amount paid differs from the amount pledged. Check the Fapshi dashboard.";
  return reason;
}

/** programmeId is saved on the donation; the title comes from the programmes list. */
export function programmeLabel(d: Raw, titles: Record<string, string>): string {
  const id = typeof d.programmeId === "string" ? d.programmeId : "";
  return id ? (titles[id] ?? id) : "General fund";
}

export const titleOf = (p: Raw): string => (typeof p.title === "string" ? p.title : (p.title?.en ?? String(p.id)));

export function summarize(docs: Raw[]) {
  let completedTotal = 0, completed = 0, pending = 0, failed = 0, review = 0;
  for (const d of docs) {
    const s = statusOf(d);
    if (s === "completed") { completed += 1; completedTotal += amountOf(d); }
    else if (s === "pending") pending += 1;
    else { failed += 1; if (needsReview(d)) review += 1; }
  }
  return { total: docs.length, completed, completedTotal, pending, failed, review };
}
