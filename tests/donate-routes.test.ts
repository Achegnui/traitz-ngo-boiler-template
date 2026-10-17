import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FapshiConfigError, FapshiError } from "@/lib/server/fapshi";
import { resetRateLimits } from "@/lib/server/rate-limit";
import { makeDeps, pendingDonation, validInput } from "./helpers/fakes";

const h = vi.hoisted(() => ({ factory: null as null | (() => unknown) }));
vi.mock("@/lib/server/donate-deps", () => ({
  donationDeps: () => {
    if (!h.factory) throw new Error("test did not set deps");
    return h.factory();
  },
}));

import { POST as initiate } from "@/app/api/donate/initiate/route";
import { GET as status } from "@/app/api/donate/status/route";
import { POST as webhook } from "@/app/api/donate/webhook/route";

let ctx: ReturnType<typeof makeDeps>;
beforeEach(() => {
  ctx = makeDeps();
  h.factory = () => ctx.deps;
  resetRateLimits();
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
});
afterEach(() => vi.restoreAllMocks());

const post = (path: string, body: unknown, headers: Record<string, string> = {}) =>
  new Request(`http://localhost:3001${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", host: "localhost:3001", "x-forwarded-for": "9.9.9.9", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
const get = (path: string, ip = "9.9.9.9") => new Request(`http://localhost:3001${path}`, { headers: { "x-forwarded-for": ip } });

describe("POST /api/donate/initiate", () => {
  it("returns the donation id and the Fapshi link, and stores a pending donation", async () => {
    const res = await initiate(post("/api/donate/initiate", validInput));
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    const body = await res.json();
    expect(body.link).toBe("https://sandbox.fapshi.com/pay/ABC123");
    expect(ctx.store.docs.get(body.donationId)).toMatchObject({ status: "pending", amount: 10000 });
  });
  it("answers 400 invalid_input and names the bad fields, saving nothing", async () => {
    const res = await initiate(post("/api/donate/initiate", { ...validInput, amount: 50, donorEmail: "x" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "invalid_input", fields: ["amount", "donorEmail"] });
    expect(ctx.store.docs.size).toBe(0);
    expect(ctx.fapshi.initiatePay).not.toHaveBeenCalled();
  });
  it("answers 400 for a body that is not JSON and 413 for an oversized one", async () => {
    expect((await initiate(post("/api/donate/initiate", "{nope"))).status).toBe(400);
    expect((await initiate(post("/api/donate/initiate", "x".repeat(5000)))).status).toBe(413);
  });
  it("answers 403 to a request from another origin", async () => {
    const res = await initiate(post("/api/donate/initiate", validInput, { origin: "https://evil.example" }));
    expect(res.status).toBe(403);
    expect(ctx.store.docs.size).toBe(0);
  });
  it("accepts a request from its own origin", async () => {
    expect((await initiate(post("/api/donate/initiate", validInput, { origin: "http://localhost:3001" }))).status).toBe(200);
  });
  it("rate limits one IP after 30 requests but not another", async () => {
    for (let i = 0; i < 30; i++) await initiate(post("/api/donate/initiate", { ...validInput, amount: 1 }));
    expect((await initiate(post("/api/donate/initiate", validInput))).status).toBe(429);
    expect((await initiate(post("/api/donate/initiate", validInput, { "x-forwarded-for": "8.8.8.8" }))).status).toBe(200);
  });
  it("answers 502 payment_unavailable when Fapshi refuses, and marks the donation failed", async () => {
    ctx.fapshi.initiatePay.mockRejectedValueOnce(new FapshiError("Invalid credentials", 401));
    const res = await initiate(post("/api/donate/initiate", validInput));
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: "payment_unavailable" });
    expect([...ctx.store.docs.values()][0].status).toBe("failed");
  });
  it("answers 503 payments_not_configured when the keys are missing, without leaking the detail", async () => {
    h.factory = () => { throw new FapshiConfigError("FAPSHI_API_KEY is missing"); };
    const res = await initiate(post("/api/donate/initiate", validInput));
    expect(res.status).toBe(503);
    expect(JSON.stringify(await res.json())).not.toContain("FAPSHI_API_KEY");
  });
  it("answers 500 server_error for anything unexpected", async () => {
    h.factory = () => { throw new Error("firestore exploded"); };
    const res = await initiate(post("/api/donate/initiate", validInput));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "server_error" });
  });
});

describe("POST /api/donate/webhook", () => {
  it("completes the donation after verifying with Fapshi, ignoring status claims in the body", async () => {
    const id = await ctx.store.create(pendingDonation());
    ctx.fapshi.getPaymentStatus.mockResolvedValueOnce({ transId: "TX123456", status: "SUCCESSFUL", amount: 10000, externalId: id });
    const res = await webhook(post("/api/donate/webhook", { transId: "TX123456", status: "FAILED", amount: 1 }));
    expect(res.status).toBe(200);
    expect(ctx.fapshi.getPaymentStatus).toHaveBeenCalledWith("TX123456");
    expect(ctx.store.docs.get(id)!.status).toBe("completed");
  });
  it("answers 200 for a transaction it does not know, so Fapshi does not retry", async () => {
    ctx.fapshi.getPaymentStatus.mockResolvedValueOnce({ transId: "TXZZZZZZ", status: "SUCCESSFUL", amount: 1, externalId: null });
    expect((await webhook(post("/api/donate/webhook", { transId: "TXZZZZZZ" }))).status).toBe(200);
    expect(ctx.store.docs.size).toBe(0);
  });
  it("answers 400 without calling Fapshi when transId is missing or unsafe", async () => {
    for (const body of [{}, { transId: 42 }, { transId: "../x" }, { transId: "a b c d" }, "[]", "nope"]) {
      expect((await webhook(post("/api/donate/webhook", body))).status).toBe(400);
    }
    expect(ctx.fapshi.getPaymentStatus).not.toHaveBeenCalled();
  });
  it("answers 502 when Fapshi cannot confirm, so the notification can be retried, and changes nothing", async () => {
    const id = await ctx.store.create(pendingDonation());
    ctx.fapshi.getPaymentStatus.mockRejectedValueOnce(new FapshiError("down", 502));
    expect((await webhook(post("/api/donate/webhook", { transId: "TX123456" }))).status).toBe(502);
    expect(ctx.store.docs.get(id)!.status).toBe("pending");
  });
});

describe("GET /api/donate/status", () => {
  it("returns the public view and refreshes a pending donation from Fapshi", async () => {
    const id = await ctx.store.create(pendingDonation());
    ctx.fapshi.getPaymentStatus.mockResolvedValueOnce({ transId: "TX123456", status: "SUCCESSFUL", amount: 10000, externalId: id });
    const res = await status(get(`/api/donate/status?id=${id}`));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "completed", amount: 10000, currency: "XAF", frequency: "one-time" });
  });
  it("answers 404 for an unknown or malformed id without touching the store", async () => {
    expect((await status(get("/api/donate/status?id=doesnotexist00000000"))).status).toBe(404);
    expect((await status(get("/api/donate/status?id=../../etc"))).status).toBe(404);
    expect((await status(get("/api/donate/status"))).status).toBe(404);
  });
  it("answers 503 when payments are not configured", async () => {
    h.factory = () => { throw new FapshiConfigError("x"); };
    expect((await status(get("/api/donate/status?id=don00000000000000001"))).status).toBe(503);
  });
});
