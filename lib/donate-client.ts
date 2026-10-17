import { MAX_AMOUNT, MIN_AMOUNT } from "@/lib/donation-limits";

/**
 * Browser-side logic of the donate form and the thank-you page, kept free of React so it can be unit tested.
 * The server (lib/server/donations.ts) stays the authority: these checks only give instant, translated feedback.
 */

export const DONATE_FORM_KEYS = [
  "amount", "custom", "frequency", "once", "monthly", "programme", "general", "name", "email", "submit", "submitting", "phone", "formTitle",
  "monthlyNote", "noScript", "errName", "errEmail", "errAmount", "errInvalid", "errRate", "errConfig", "errUnavailable", "errServer", "errNetwork",
] as const;
export type DonateFormStrings = Record<(typeof DONATE_FORM_KEYS)[number], string>;

export const THANKS_KEYS = [
  "checkingTitle", "checkingBody", "retrying", "completedTitle", "completedBody", "completedMonthly", "failedTitle", "failedBody",
  "timeoutTitle", "timeoutBody", "notFoundTitle", "notFoundBody", "tryAgain", "checkAgain", "contact", "home", "noScript",
] as const;
export type ThanksStrings = Record<(typeof THANKS_KEYS)[number], string>;

/** Messages are handed over raw (they can contain {placeholders}); this fills them in. */
export const fill = (s: string, vars: Record<string, string>) => s.replace(/\{(\w+)\}/g, (m, k: string) => vars[k] ?? m);

export type ErrorKey = "errInvalid" | "errRate" | "errConfig" | "errUnavailable" | "errServer" | "errNetwork";
export type Frequency = "once" | "monthly";
export type FormFields = { amount: number | "custom"; custom: string; name: string; email: string; freq: Frequency; programmeId: string; locale: string };
export type FieldErrors = { amount?: true; name?: true; email?: true };
export type DonationPayload = {
  amount: number; donorName: string; donorEmail: string; frequency: "one-time" | "monthly"; programmeId: string; locale: string;
};

export const totalOf = (amount: number | "custom", custom: string): number => (amount === "custom" ? Number(custom) || 0 : amount);

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateForm(f: FormFields): { ok: true; payload: DonationPayload } | { ok: false; errors: FieldErrors } {
  const total = totalOf(f.amount, f.custom);
  const errors: FieldErrors = {};
  if (!Number.isInteger(total) || total < MIN_AMOUNT || total > MAX_AMOUNT) errors.amount = true;
  if (!f.name.trim()) errors.name = true;
  if (!EMAIL.test(f.email.trim())) errors.email = true;
  if (errors.amount || errors.name || errors.email) return { ok: false, errors };
  return {
    ok: true,
    payload: {
      amount: total,
      donorName: f.name.trim(),
      donorEmail: f.email.trim(),
      frequency: f.freq === "monthly" ? "monthly" : "one-time", // the form says "once", the API and the admin say "one-time"
      programmeId: f.programmeId,
      locale: f.locale,
    },
  };
}

/** Maps the error codes of /api/donate/* to a message key. Anything unknown is a generic server error. */
export function errorKeyFor(code: unknown): ErrorKey {
  switch (code) {
    case "invalid_input":
    case "invalid_json":
    case "too_large": return "errInvalid";
    case "rate_limited": return "errRate";
    case "payments_not_configured": return "errConfig";
    case "payment_unavailable": return "errUnavailable";
    default: return "errServer";
  }
}

export async function submitDonation(payload: DonationPayload, fetchImpl: typeof fetch = fetch): Promise<{ ok: true; link: string } | { ok: false; error: ErrorKey }> {
  let res: Response;
  try {
    res = await fetchImpl("/api/donate/initiate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  } catch {
    return { ok: false, error: "errNetwork" };
  }
  const body: unknown = await res.json().catch(() => null);
  const rec = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  // Only ever send the donor to an https address.
  if (res.ok && typeof rec.link === "string" && rec.link.startsWith("https://")) return { ok: true, link: rec.link };
  return { ok: false, error: res.ok ? "errServer" : errorKeyFor(rec.error) };
}

export const DONATION_ID = /^[A-Za-z0-9]{10,40}$/;
export const POLL_EVERY_MS = 3000;
export const POLL_MAX_MS = 3 * 60_000;

export type StatusResult =
  | { kind: "ok"; status: "pending" | "completed" | "failed"; amount: number; currency: string; frequency: "one-time" | "monthly" }
  | { kind: "notfound" }
  | { kind: "error" };

export async function fetchDonationStatus(id: string, fetchImpl: typeof fetch = fetch): Promise<StatusResult> {
  if (!DONATION_ID.test(id)) return { kind: "notfound" };
  let res: Response;
  try {
    res = await fetchImpl(`/api/donate/status?id=${encodeURIComponent(id)}`, { cache: "no-store" });
  } catch {
    return { kind: "error" };
  }
  if (res.status === 404) return { kind: "notfound" };
  const b = (await res.json().catch(() => null)) as Record<string, unknown> | null;
  const okStatus = b && (b.status === "pending" || b.status === "completed" || b.status === "failed");
  if (!res.ok || !b || !okStatus || typeof b.amount !== "number") return { kind: "error" };
  return {
    kind: "ok",
    status: b.status as "pending" | "completed" | "failed",
    amount: b.amount,
    currency: typeof b.currency === "string" ? b.currency : "XAF",
    frequency: b.frequency === "monthly" ? "monthly" : "one-time",
  };
}

/**
 * The thank-you link carries ?d=<id>. The language switcher drops query strings, so the id is also kept for this
 * browser session, which lets a donor switch language without losing their status.
 */
const STORE_KEY = "traitz:donation";
type Store = Pick<Storage, "getItem" | "setItem">;
const defaultStore = (): Store | null => {
  try { return globalThis.sessionStorage ?? null; } catch { return null; }
};
export function resolveDonationId(fromUrl: string | null, store: Store | null = defaultStore()): string | null {
  try {
    if (fromUrl && DONATION_ID.test(fromUrl)) {
      store?.setItem(STORE_KEY, fromUrl);
      return fromUrl;
    }
    const saved = store?.getItem(STORE_KEY) ?? null;
    return saved && DONATION_ID.test(saved) ? saved : null;
  } catch {
    return fromUrl && DONATION_ID.test(fromUrl) ? fromUrl : null;
  }
}
