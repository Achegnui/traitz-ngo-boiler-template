import { describe, expect, it, vi } from "vitest";
import {
  DONATE_FORM_KEYS, errorKeyFor, fetchDonationStatus, fill, resolveDonationId, submitDonation, totalOf, validateForm, type FormFields,
} from "@/lib/donate-client";
import { MAX_AMOUNT, MIN_AMOUNT } from "@/lib/donation-limits";
import { donationInput } from "@/lib/server/donations";

const base: FormFields = { amount: 10000, custom: "", name: "Ada Ngu", email: "ada@example.test", freq: "once", programmeId: "", locale: "en" };
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const fetchOf = (fn: () => Promise<Response>) => vi.fn(fn) as unknown as typeof fetch;
const ID = "don00000000000000001";

describe("validateForm", () => {
  it("builds a payload the server schema accepts, mapping once to one-time", () => {
    const r = validateForm(base);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.payload).toEqual({ amount: 10000, donorName: "Ada Ngu", donorEmail: "ada@example.test", frequency: "one-time", programmeId: "", locale: "en" });
      expect(donationInput.safeParse(r.payload).success).toBe(true);
    }
  });
  it("keeps monthly, trims text and uses the custom amount", () => {
    const r = validateForm({ ...base, amount: "custom", custom: "2500", freq: "monthly", name: "  Ada  ", email: " ada@example.test ", programmeId: "water", locale: "fr" });
    expect(r.ok && r.payload).toMatchObject({ amount: 2500, frequency: "monthly", donorName: "Ada", donorEmail: "ada@example.test", programmeId: "water", locale: "fr" });
    expect(r.ok && donationInput.safeParse(r.payload).success).toBe(true);
  });
  it("flags a custom amount outside the allowed range, using the same limits as the server", () => {
    for (const custom of ["", "0", String(MIN_AMOUNT - 1), String(MAX_AMOUNT + 1)]) {
      expect(validateForm({ ...base, amount: "custom", custom })).toEqual({ ok: false, errors: { amount: true } });
    }
    expect(validateForm({ ...base, amount: "custom", custom: String(MIN_AMOUNT) }).ok).toBe(true);
    expect(validateForm({ ...base, amount: "custom", custom: String(MAX_AMOUNT) }).ok).toBe(true);
  });
  it("flags a blank name and a bad e-mail, and reports every problem at once", () => {
    expect(validateForm({ ...base, name: "   " })).toEqual({ ok: false, errors: { name: true } });
    expect(validateForm({ ...base, email: "nope" })).toEqual({ ok: false, errors: { email: true } });
    expect(validateForm({ ...base, amount: "custom", custom: "5", name: "", email: "x@y" })).toEqual({ ok: false, errors: { amount: true, name: true, email: true } });
  });
  it("totalOf treats an unparseable custom amount as zero", () => {
    expect(totalOf("custom", "abc")).toBe(0);
    expect(totalOf(5000, "999")).toBe(5000);
  });
});

describe("errorKeyFor", () => {
  it("maps every code the API can return to a message that exists in the form strings", () => {
    const codes = ["invalid_input", "invalid_json", "too_large", "rate_limited", "payments_not_configured", "payment_unavailable", "server_error", "forbidden", undefined, 42];
    for (const c of codes) expect(DONATE_FORM_KEYS).toContain(errorKeyFor(c));
    expect(errorKeyFor("invalid_input")).toBe("errInvalid");
    expect(errorKeyFor("rate_limited")).toBe("errRate");
    expect(errorKeyFor("payments_not_configured")).toBe("errConfig");
    expect(errorKeyFor("payment_unavailable")).toBe("errUnavailable");
    expect(errorKeyFor("forbidden")).toBe("errServer");
  });
});

describe("submitDonation", () => {
  const payload = { amount: 5000, donorName: "A", donorEmail: "a@b.co", frequency: "one-time" as const, programmeId: "", locale: "en" };
  it("POSTs JSON to /api/donate/initiate and returns the https link", async () => {
    const f = fetchOf(async () => reply({ donationId: ID, link: "https://sandbox.fapshi.com/pay/X" }));
    expect(await submitDonation(payload, f)).toEqual({ ok: true, link: "https://sandbox.fapshi.com/pay/X" });
    const [url, init] = (f as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/donate/initiate");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual(payload);
  });
  it.each(["http://insecure.test/pay", "javascript:alert(1)", "//evil.test"])("never follows a link that is not https (%s)", async (link) => {
    expect(await submitDonation(payload, fetchOf(async () => reply({ link })))).toEqual({ ok: false, error: "errServer" });
  });
  it("turns API errors into message keys", async () => {
    expect(await submitDonation(payload, fetchOf(async () => reply({ error: "rate_limited" }, 429)))).toEqual({ ok: false, error: "errRate" });
    expect(await submitDonation(payload, fetchOf(async () => reply({ error: "payment_unavailable" }, 502)))).toEqual({ ok: false, error: "errUnavailable" });
    expect(await submitDonation(payload, fetchOf(async () => new Response("<html>", { status: 500 })))).toEqual({ ok: false, error: "errServer" });
  });
  it("reports a network failure", async () => {
    expect(await submitDonation(payload, fetchOf(async () => { throw new TypeError("offline"); }))).toEqual({ ok: false, error: "errNetwork" });
  });
});

describe("fetchDonationStatus", () => {
  it("reads a valid status", async () => {
    const f = fetchOf(async () => reply({ status: "completed", amount: 10000, currency: "XAF", frequency: "monthly" }));
    expect(await fetchDonationStatus(ID, f)).toEqual({ kind: "ok", status: "completed", amount: 10000, currency: "XAF", frequency: "monthly" });
    expect((f as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBe(`/api/donate/status?id=${ID}`);
  });
  it("says notfound on 404 and for a malformed id, without calling the network for the latter", async () => {
    expect(await fetchDonationStatus(ID, fetchOf(async () => reply({ error: "not_found" }, 404)))).toEqual({ kind: "notfound" });
    const f = vi.fn();
    expect(await fetchDonationStatus("../x", f as unknown as typeof fetch)).toEqual({ kind: "notfound" });
    expect(f).not.toHaveBeenCalled();
  });
  it("says error (so the page keeps polling) for 429, 5xx, a network failure and a strange body", async () => {
    expect(await fetchDonationStatus(ID, fetchOf(async () => reply({ error: "rate_limited" }, 429)))).toEqual({ kind: "error" });
    expect(await fetchDonationStatus(ID, fetchOf(async () => reply({}, 500)))).toEqual({ kind: "error" });
    expect(await fetchDonationStatus(ID, fetchOf(async () => { throw new TypeError("x"); }))).toEqual({ kind: "error" });
    expect(await fetchDonationStatus(ID, fetchOf(async () => reply({ status: "weird", amount: 1 })))).toEqual({ kind: "error" });
  });
});

describe("resolveDonationId", () => {
  const memory = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) }; };
  it("uses the id in the URL and remembers it for the session", () => {
    const s = memory();
    expect(resolveDonationId(ID, s)).toBe(ID);
    expect(resolveDonationId(null, s)).toBe(ID); // after a language switch the query string is gone
  });
  it("returns null with nothing in the URL or the store, and ignores a malformed id", () => {
    expect(resolveDonationId(null, memory())).toBeNull();
    const s = memory();
    expect(resolveDonationId("../../x", s)).toBeNull();
    expect(resolveDonationId(null, s)).toBeNull();
  });
  it("still works when storage is blocked", () => {
    const blocked = { getItem: () => { throw new Error("denied"); }, setItem: () => { throw new Error("denied"); } };
    expect(resolveDonationId(ID, blocked)).toBe(ID);
    expect(resolveDonationId(null, blocked)).toBeNull();
  });
});

describe("fill", () => {
  it("replaces known placeholders and leaves unknown ones alone", () => {
    expect(fill("between {min} and {max} XAF {other}", { min: "100", max: "1,000,000" })).toBe("between 100 and 1,000,000 XAF {other}");
  });
});
