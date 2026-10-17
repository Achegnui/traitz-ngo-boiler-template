import { vi } from "vitest";
import type { Donation, DonationDeps, DonationStore } from "@/lib/server/donations";
import type { FapshiClient, InitiatePayInput, PaymentStatus } from "@/lib/server/fapshi";

/** In-memory DonationStore with the same contract as the Firestore one. */
export function memoryStore(): DonationStore & { docs: Map<string, Donation> } {
  const docs = new Map<string, Donation>();
  let n = 0;
  return {
    docs,
    async create(d) {
      const id = `don${String(++n).padStart(17, "0")}`; // 20 alphanumeric characters, like a Firestore id
      docs.set(id, structuredClone(d));
      return id;
    },
    async get(id) {
      const d = docs.get(id);
      return d ? structuredClone(d) : null;
    },
    async findByTransactionId(transId) {
      for (const [id, d] of docs) if (d.fapshiTransactionId === transId) return { id, donation: structuredClone(d) };
      return null;
    },
    async transition(id, decide) {
      const cur = docs.get(id);
      if (!cur) return null;
      const patch = decide(structuredClone(cur));
      if (!patch) return structuredClone(cur);
      const next = { ...cur, ...patch };
      docs.set(id, next);
      return structuredClone(next);
    },
  };
}

export function fakeFapshi(over: Partial<FapshiClient> = {}) {
  const base = {
    initiatePay: vi.fn(async (_input: InitiatePayInput) => ({ link: "https://sandbox.fapshi.com/pay/ABC123", transId: "TX123456" })),
    getPaymentStatus: vi.fn(async (transId: string): Promise<PaymentStatus> => ({ transId, status: "PENDING", amount: null, externalId: null })),
  } satisfies FapshiClient;
  return Object.assign(base, over) as typeof base;
}

export const FIXED_NOW = new Date("2026-10-16T10:00:00.000Z");

export function makeDeps(over: Partial<DonationDeps> = {}) {
  const store = memoryStore();
  const fapshi = fakeFapshi();
  const deps: DonationDeps = { store, fapshi, siteUrl: "http://localhost:3001", now: () => FIXED_NOW, ...over };
  return { deps, store, fapshi: deps.fapshi as ReturnType<typeof fakeFapshi> };
}

export const validInput = {
  amount: 10000,
  donorName: "Ada Ngu",
  donorEmail: "ada@example.test",
  frequency: "one-time" as const,
  programmeId: "water",
  locale: "en" as const,
};

export function pendingDonation(over: Partial<Donation> = {}): Donation {
  return {
    amount: 10000, currency: "XAF", donorName: "Ada Ngu", donorEmail: "ada@example.test", frequency: "one-time", programmeId: null, locale: "en",
    fapshiTransactionId: "TX123456", status: "pending", createdAt: FIXED_NOW.toISOString(), updatedAt: FIXED_NOW.toISOString(), ...over,
  };
}
