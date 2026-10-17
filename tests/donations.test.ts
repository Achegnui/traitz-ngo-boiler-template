import { describe, expect, it, vi } from "vitest";
import { applyPaymentStatus, DonationError, donationInput, getDonationStatus, mapStatus, settleByTransactionId, startDonation } from "@/lib/server/donations";
import { FapshiError } from "@/lib/server/fapshi";
import { FIXED_NOW, makeDeps, pendingDonation, validInput } from "./helpers/fakes";

describe("donationInput", () => {
  it("accepts a valid donation and normalises the e-mail", () => {
    const r = donationInput.parse({ ...validInput, donorEmail: "  ADA@Example.TEST " });
    expect(r.donorEmail).toBe("ada@example.test");
  });
  it("treats an empty programme as general and keeps a real one", () => {
    expect(donationInput.parse({ ...validInput, programmeId: "" }).programmeId).toBeUndefined();
    expect(donationInput.parse(validInput).programmeId).toBe("water");
  });
  it.each([
    ["amount below Fapshi's minimum", { amount: 99 }],
    ["amount above the cap", { amount: 1_000_001 }],
    ["fractional amount", { amount: 150.5 }],
    ["amount as a string", { amount: "5000" }],
    ["blank name", { donorName: "   " }],
    ["bad e-mail", { donorEmail: "not-an-email" }],
    ["unknown frequency", { frequency: "weekly" }],
    ["unknown locale", { locale: "de" }],
    ["programme id with a slash", { programmeId: "a/b" }],
  ])("rejects %s", (_label, patch) => {
    expect(donationInput.safeParse({ ...validInput, ...patch }).success).toBe(false);
  });
});

describe("mapStatus", () => {
  it("maps Fapshi statuses, and anything unknown stays pending", () => {
    expect(mapStatus("SUCCESSFUL")).toBe("completed");
    expect(mapStatus("successful")).toBe("completed");
    expect(mapStatus("FAILED")).toBe("failed");
    expect(mapStatus("EXPIRED")).toBe("failed");
    expect(mapStatus("CREATED")).toBe("pending");
    expect(mapStatus("PENDING")).toBe("pending");
    expect(mapStatus("SOMETHING_NEW")).toBe("pending");
  });
});

describe("startDonation", () => {
  it("saves a pending donation, passes its id as externalId, stores the transaction id and returns the link", async () => {
    const { deps, store, fapshi } = makeDeps();
    const out = await startDonation(deps, donationInput.parse(validInput));
    expect(out.link).toBe("https://sandbox.fapshi.com/pay/ABC123");
    const saved = store.docs.get(out.donationId)!;
    expect(saved).toMatchObject({
      amount: 10000, currency: "XAF", donorName: "Ada Ngu", donorEmail: "ada@example.test", frequency: "one-time", programmeId: "water", locale: "en",
      status: "pending", fapshiTransactionId: "TX123456", createdAt: FIXED_NOW.toISOString(),
    });
    expect(fapshi.initiatePay).toHaveBeenCalledWith({
      amount: 10000, email: "ada@example.test", externalId: out.donationId,
      redirectUrl: `http://localhost:3001/en/donate/thank-you?d=${out.donationId}`, message: "Donation",
    });
  });
  it("builds the return link in the donor's language and stores general donations with a null programme", async () => {
    const { deps, store, fapshi } = makeDeps();
    const { donationId } = await startDonation(deps, donationInput.parse({ ...validInput, locale: "fr", programmeId: "" }));
    expect(fapshi.initiatePay.mock.calls[0][0].redirectUrl).toBe(`http://localhost:3001/fr/donate/thank-you?d=${donationId}`);
    expect(store.docs.get(donationId)!.programmeId).toBeNull();
  });
  it("marks the donation failed and raises payment_unavailable when Fapshi refuses", async () => {
    const { deps, store, fapshi } = makeDeps();
    fapshi.initiatePay.mockRejectedValueOnce(new FapshiError("Invalid credentials", 401));
    const err = await startDonation(deps, donationInput.parse(validInput)).catch((e) => e);
    expect(err).toBeInstanceOf(DonationError);
    expect(err.code).toBe("payment_unavailable");
    const [doc] = [...store.docs.values()];
    expect(doc).toMatchObject({ status: "failed", failureReason: "fapshi_401", fapshiTransactionId: null });
  });
  it("rethrows an unexpected error after marking the donation failed", async () => {
    const { deps, store, fapshi } = makeDeps();
    fapshi.initiatePay.mockRejectedValueOnce(new Error("boom"));
    await expect(startDonation(deps, donationInput.parse(validInput))).rejects.toThrow("boom");
    expect([...store.docs.values()][0]).toMatchObject({ status: "failed", failureReason: "initiate_failed" });
  });
});

describe("applyPaymentStatus", () => {
  const status = (over = {}) => ({ transId: "TX123456", status: "SUCCESSFUL", amount: 10000, externalId: "don00000000000000001", ...over });
  async function seeded(over = {}) {
    const ctx = makeDeps();
    const id = await ctx.store.create(pendingDonation(over));
    return { ...ctx, id };
  }

  it("completes a pending donation on SUCCESSFUL", async () => {
    const { deps, store, id } = await seeded();
    await applyPaymentStatus(deps, id, status());
    expect(store.docs.get(id)).toMatchObject({ status: "completed" });
  });
  it.each(["FAILED", "EXPIRED"])("fails a pending donation on %s and records why", async (s) => {
    const { deps, store, id } = await seeded();
    await applyPaymentStatus(deps, id, status({ status: s, amount: null }));
    expect(store.docs.get(id)).toMatchObject({ status: "failed", failureReason: `fapshi_${s.toLowerCase()}` });
  });
  it("leaves a donation pending while Fapshi says PENDING", async () => {
    const { deps, store, id } = await seeded();
    await applyPaymentStatus(deps, id, status({ status: "PENDING", amount: null }));
    expect(store.docs.get(id)!.status).toBe("pending");
  });
  it("never moves a completed donation, whatever Fapshi says later", async () => {
    const { deps, store, id } = await seeded({ status: "completed" });
    await applyPaymentStatus(deps, id, status({ status: "FAILED" }));
    expect(store.docs.get(id)!.status).toBe("completed");
  });
  it("can still complete a donation that was marked failed earlier, and clears the old reason", async () => {
    const { deps, store, id } = await seeded({ status: "failed", failureReason: "fapshi_expired" });
    await applyPaymentStatus(deps, id, status());
    expect(store.docs.get(id)).toMatchObject({ status: "completed", failureReason: null });
  });
  it("does not complete when the paid amount differs from the stored amount", async () => {
    const { deps, store, id } = await seeded();
    await applyPaymentStatus(deps, id, status({ amount: 100 }));
    expect(store.docs.get(id)).toMatchObject({ status: "failed", failureReason: "amount_mismatch_100" });
  });
  it("ignores a status that belongs to a different transaction", async () => {
    const { deps, store, id } = await seeded();
    await applyPaymentStatus(deps, id, status({ transId: "OTHER99999" }));
    expect(store.docs.get(id)).toMatchObject({ status: "pending", fapshiTransactionId: "TX123456" });
  });
  it("records the transaction id when the donation did not have one yet", async () => {
    const { deps, store, id } = await seeded({ fapshiTransactionId: null });
    await applyPaymentStatus(deps, id, status());
    expect(store.docs.get(id)).toMatchObject({ status: "completed", fapshiTransactionId: "TX123456" });
  });
  it("writes nothing when nothing changes", async () => {
    const { deps, store, id } = await seeded();
    const before = structuredClone(store.docs.get(id));
    await applyPaymentStatus({ ...deps, now: () => new Date("2030-01-01") }, id, status({ status: "PENDING", amount: null }));
    expect(store.docs.get(id)).toEqual(before);
  });
});

describe("settleByTransactionId (webhook path)", () => {
  it("asks Fapshi for the real status, finds the donation by externalId and completes it", async () => {
    const { deps, store, fapshi } = makeDeps();
    const id = await store.create(pendingDonation());
    fapshi.getPaymentStatus.mockResolvedValueOnce({ transId: "TX123456", status: "SUCCESSFUL", amount: 10000, externalId: id });
    expect(await settleByTransactionId(deps, "TX123456")).toEqual({ outcome: "completed" });
    expect(fapshi.getPaymentStatus).toHaveBeenCalledWith("TX123456");
    expect(store.docs.get(id)!.status).toBe("completed");
  });
  it("falls back to the transaction id when Fapshi returns no externalId", async () => {
    const { deps, store, fapshi } = makeDeps();
    const id = await store.create(pendingDonation());
    fapshi.getPaymentStatus.mockResolvedValueOnce({ transId: "TX123456", status: "FAILED", amount: null, externalId: null });
    expect(await settleByTransactionId(deps, "TX123456")).toEqual({ outcome: "failed" });
    expect(store.docs.get(id)!.status).toBe("failed");
  });
  it("reports unknown for a transaction that is not ours and touches nothing", async () => {
    const { deps, store, fapshi } = makeDeps();
    fapshi.getPaymentStatus.mockResolvedValueOnce({ transId: "TXZZZZZZ", status: "SUCCESSFUL", amount: 500, externalId: "nope" });
    expect(await settleByTransactionId(deps, "TXZZZZZZ")).toEqual({ outcome: "unknown" });
    expect(store.docs.size).toBe(0);
  });
  it("reports mismatch when the donation belongs to a different transaction", async () => {
    const { deps, store, fapshi } = makeDeps();
    const id = await store.create(pendingDonation({ fapshiTransactionId: "TX123456" }));
    fapshi.getPaymentStatus.mockResolvedValueOnce({ transId: "TXATTACK1", status: "SUCCESSFUL", amount: 10000, externalId: id });
    expect(await settleByTransactionId(deps, "TXATTACK1")).toEqual({ outcome: "mismatch" });
    expect(store.docs.get(id)!.status).toBe("pending");
  });
  it("lets a Fapshi failure propagate so the webhook can answer with an error and be retried", async () => {
    const { deps, fapshi } = makeDeps();
    fapshi.getPaymentStatus.mockRejectedValueOnce(new FapshiError("down", 502));
    await expect(settleByTransactionId(deps, "TX123456")).rejects.toBeInstanceOf(FapshiError);
  });
});

describe("getDonationStatus (thank-you page)", () => {
  it("returns null for an unknown id", async () => {
    expect(await getDonationStatus(makeDeps().deps, "nope")).toBeNull();
  });
  it("returns only non-personal fields", async () => {
    const { deps, store } = makeDeps();
    const id = await store.create(pendingDonation({ status: "completed" }));
    const out = await getDonationStatus(deps, id);
    expect(out).toEqual({ status: "completed", amount: 10000, currency: "XAF", frequency: "one-time" });
    expect(JSON.stringify(out)).not.toMatch(/ada|example\.test/i);
  });
  it("re-checks a pending donation with Fapshi and saves the result", async () => {
    const { deps, store, fapshi } = makeDeps();
    const id = await store.create(pendingDonation());
    fapshi.getPaymentStatus.mockResolvedValueOnce({ transId: "TX123456", status: "SUCCESSFUL", amount: 10000, externalId: id });
    expect((await getDonationStatus(deps, id))!.status).toBe("completed");
    expect(store.docs.get(id)!.status).toBe("completed");
  });
  it("does not call Fapshi for a donation that is already final or has no transaction yet", async () => {
    const { deps, store, fapshi } = makeDeps();
    const done = await store.create(pendingDonation({ status: "failed" }));
    const fresh = await store.create(pendingDonation({ fapshiTransactionId: null }));
    await getDonationStatus(deps, done);
    expect((await getDonationStatus(deps, fresh))!.status).toBe("pending");
    expect(fapshi.getPaymentStatus).not.toHaveBeenCalled();
  });
  it("keeps the stored status when Fapshi cannot be reached", async () => {
    const { deps, store, fapshi } = makeDeps();
    const id = await store.create(pendingDonation());
    fapshi.getPaymentStatus.mockRejectedValueOnce(new FapshiError("timeout", 504));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    expect((await getDonationStatus(deps, id))!.status).toBe("pending");
    warn.mockRestore();
  });
});
