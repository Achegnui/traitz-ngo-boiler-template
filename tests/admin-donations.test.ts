import { describe, expect, it } from "vitest";
import {
  amountOf, describeFailure, filterDonations, formatAmount, formatWhen, isStalePending, needsReview, programmeLabel, sortNewestFirst, statusOf,
  STALE_PENDING_MS, summarize, titleOf,
} from "@/lib/admin/donations";
import { applyPaymentStatus, donationInput, startDonation } from "@/lib/server/donations";
import { FapshiError } from "@/lib/server/fapshi";
import { makeDeps, pendingDonation, validInput } from "./helpers/fakes";

const d = (over: Record<string, unknown> = {}) => ({ id: "x", amount: 1000, currency: "XAF", status: "completed", createdAt: "2026-10-14T09:30:00.000Z", ...over });
const NOW = Date.parse("2026-10-16T12:00:00.000Z");

describe("statusOf", () => {
  it("keeps completed and failed, and shows anything else as pending so it is never counted as money received", () => {
    expect(statusOf(d({ status: "completed" }))).toBe("completed");
    expect(statusOf(d({ status: "failed" }))).toBe("failed");
    expect(statusOf(d({ status: "pending" }))).toBe("pending");
    expect(statusOf(d({ status: "paid" }))).toBe("pending");
    expect(statusOf(d({ status: undefined }))).toBe("pending");
  });
});

describe("summarize", () => {
  it("counts each state and adds up only completed donations", () => {
    const docs = [d({ amount: 5000 }), d({ amount: 25000 }), d({ status: "pending", amount: 99999 }), d({ status: "failed", amount: 88888, failureReason: "fapshi_expired" }), d({ status: "failed", failureReason: "amount_mismatch_100" })];
    expect(summarize(docs)).toEqual({ total: 5, completed: 2, completedTotal: 30000, pending: 1, failed: 2, review: 1 });
  });
  it("copes with an empty list and with a missing or garbled amount", () => {
    expect(summarize([])).toEqual({ total: 0, completed: 0, completedTotal: 0, pending: 0, failed: 0, review: 0 });
    expect(summarize([d({ amount: undefined }), d({ amount: "abc" }), d({ amount: "2500" })]).completedTotal).toBe(2500);
    expect(amountOf(d({ amount: null }))).toBe(0);
  });
});

describe("filterDonations and sortNewestFirst", () => {
  const docs = [d({ id: "a", status: "completed" }), d({ id: "b", status: "pending" }), d({ id: "c", status: "failed" }), d({ id: "e", status: "weird" })];
  it("filters by status and treats unknown values as pending", () => {
    expect(filterDonations(docs, "all")).toHaveLength(4);
    expect(filterDonations(docs, "completed").map((x) => x.id)).toEqual(["a"]);
    expect(filterDonations(docs, "pending").map((x) => x.id)).toEqual(["b", "e"]);
    expect(filterDonations(docs, "failed").map((x) => x.id)).toEqual(["c"]);
  });
  it("sorts newest first without changing the input", () => {
    const list = [d({ id: "old", createdAt: "2026-09-01T00:00:00Z" }), d({ id: "new", createdAt: "2026-10-01T00:00:00Z" }), d({ id: "none", createdAt: undefined })];
    expect(sortNewestFirst(list).map((x) => x.id)).toEqual(["new", "old", "none"]);
    expect(list[0].id).toBe("old");
  });
});

describe("display helpers", () => {
  it("formats amounts, dates and programmes", () => {
    expect(formatAmount(d({ amount: 1250000 }))).toBe("1,250,000 XAF");
    expect(formatAmount(d({ currency: undefined, amount: 100 }))).toBe("100 XAF");
    expect(formatWhen("2026-10-14T09:30:15.000Z")).toBe("2026-10-14 09:30");
    expect(formatWhen(undefined)).toBe("");
    expect(programmeLabel(d({ programmeId: "wum-water" }), { "wum-water": "Wum Water Project" })).toBe("Wum Water Project");
    expect(programmeLabel(d({ programmeId: "deleted-one" }), {})).toBe("deleted-one");
    expect(programmeLabel(d({ programmeId: null }), {})).toBe("General fund");
    expect(programmeLabel(d({}), {})).toBe("General fund");
    expect(titleOf({ id: "p", title: { en: "Water", fr: "Eau" } })).toBe("Water");
    expect(titleOf({ id: "p", title: "Plain" })).toBe("Plain");
    expect(titleOf({ id: "p" })).toBe("p");
  });
});

describe("needsReview and isStalePending", () => {
  it("flags only failed donations whose amount differed from the pledge", () => {
    expect(needsReview(d({ status: "failed", failureReason: "amount_mismatch_800" }))).toBe(true);
    expect(needsReview(d({ status: "failed", failureReason: "fapshi_expired" }))).toBe(false);
    expect(needsReview(d({ status: "completed", failureReason: "amount_mismatch_1" }))).toBe(false);
  });
  it("calls a pending donation abandoned only after a day", () => {
    const at = (ms: number) => new Date(NOW - ms).toISOString();
    expect(isStalePending(d({ status: "pending", createdAt: at(STALE_PENDING_MS - 1000) }), NOW)).toBe(false);
    expect(isStalePending(d({ status: "pending", createdAt: at(STALE_PENDING_MS + 1000) }), NOW)).toBe(true);
    expect(isStalePending(d({ status: "completed", createdAt: at(STALE_PENDING_MS * 5) }), NOW)).toBe(false);
    expect(isStalePending(d({ status: "pending", createdAt: "not a date" }), NOW)).toBe(false);
  });
});

describe("describeFailure", () => {
  it("explains each reason in plain words", () => {
    expect(describeFailure("fapshi_failed")).toMatch(/failed or was declined/);
    expect(describeFailure("fapshi_expired")).toMatch(/expired/);
    expect(describeFailure("initiate_failed")).toMatch(/could not be started/);
    expect(describeFailure("fapshi_401")).toBe("The payment could not be started (Fapshi error 401).");
    expect(describeFailure("amount_mismatch_1500")).toContain("1,500 XAF");
    expect(describeFailure("amount_mismatch_x")).toMatch(/differs/);
  });
  it("returns nothing for no reason and the raw text for one it does not know", () => {
    expect(describeFailure(undefined)).toBeNull();
    expect(describeFailure("")).toBeNull();
    expect(describeFailure(null)).toBeNull();
    expect(describeFailure("something_new")).toBe("something_new");
  });
  it("describes every reason the server can actually write", async () => {
    const reasons = new Set<string>();
    // Fapshi says failed or expired
    for (const s of ["FAILED", "EXPIRED"]) {
      const { deps, store } = makeDeps();
      const id = await store.create(pendingDonation());
      await applyPaymentStatus(deps, id, { transId: "TX123456", status: s, amount: null, externalId: id });
      reasons.add(String(store.docs.get(id)!.failureReason));
    }
    // paid amount differs from the pledge
    { const { deps, store } = makeDeps(); const id = await store.create(pendingDonation()); await applyPaymentStatus(deps, id, { transId: "TX123456", status: "SUCCESSFUL", amount: 100, externalId: id }); reasons.add(String(store.docs.get(id)!.failureReason)); }
    // the payment could not be started: Fapshi error codes and a non-Fapshi error
    for (const err of [new FapshiError("bad", 401), new FapshiError("slow", 504), new Error("boom")]) {
      const { deps, store, fapshi } = makeDeps();
      fapshi.initiatePay.mockRejectedValueOnce(err);
      await startDonation(deps, donationInput.parse(validInput)).catch(() => undefined);
      reasons.add(String([...store.docs.values()][0].failureReason));
    }
    expect(reasons.size).toBe(6);
    for (const r of reasons) expect(describeFailure(r), `no sentence for "${r}"`).not.toBe(r);
  });
});
