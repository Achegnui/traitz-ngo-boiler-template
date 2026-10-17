import type { Firestore } from "firebase-admin/firestore";
import type { Donation, DonationStore } from "@/lib/server/donations";

/** The real store: /donations in Firestore, through the Admin SDK (the only writer, see firestore.rules). */
export function firestoreDonationStore(db: Firestore): DonationStore {
  const col = db.collection("donations");
  return {
    async create(donation) {
      const ref = col.doc();
      await ref.set(donation);
      return ref.id;
    },
    async get(id) {
      const snap = await col.doc(id).get();
      return snap.exists ? (snap.data() as Donation) : null;
    },
    async findByTransactionId(transId) {
      const snap = await col.where("fapshiTransactionId", "==", transId).limit(1).get();
      const doc = snap.docs[0];
      return doc ? { id: doc.id, donation: doc.data() as Donation } : null;
    },
    async transition(id, decide) {
      return db.runTransaction(async (tx) => {
        const ref = col.doc(id);
        const snap = await tx.get(ref);
        if (!snap.exists) return null;
        const current = snap.data() as Donation;
        const patch = decide(current);
        if (!patch) return current;
        tx.update(ref, patch);
        return { ...current, ...patch };
      });
    },
  };
}
