import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { getDb } from "@/lib/firebase";

export type WithId<T> = T & { id: string };

/** DATA_SOURCE=local serves the bundled seed data (offline dev, CI). Anything else reads Firestore. */
const useLocal = () => process.env.DATA_SOURCE === "local";
const denied = (e: unknown) => (e as { code?: string } | null)?.code === "permission-denied";

/** One document by id, or null if it does not exist or the rules hide it (e.g. a draft). */
export async function readDoc<T>(coll: string, id: string): Promise<WithId<T> | null> {
  if (useLocal()) {
    const { seedDocs } = await import("@/scripts/seed-data");
    const d = seedDocs.find((x) => x.collection === coll && x.id === id);
    return d ? ({ ...structuredClone(d.data), id } as WithId<T>) : null;
  }
  try {
    const snap = await getDoc(doc(getDb(), coll, id));
    return snap.exists() ? ({ ...snap.data(), id: snap.id } as WithId<T>) : null;
  } catch (e) {
    if (denied(e)) return null;
    throw e;
  }
}

/**
 * Every published document in a collection, unordered. Filtering on status here (and again in the
 * security rules) means no composite index is needed: callers sort in memory, which is fine at NGO scale.
 */
export async function readPublished<T>(coll: string): Promise<WithId<T>[]> {
  if (useLocal()) {
    const { seedDocs } = await import("@/scripts/seed-data");
    return seedDocs
      .filter((x) => x.collection === coll && x.data.status === "published")
      .map((x) => ({ ...structuredClone(x.data), id: x.id }) as WithId<T>);
  }
  const snap = await getDocs(query(collection(getDb(), coll), where("status", "==", "published")));
  return snap.docs.map((d) => ({ ...d.data(), id: d.id }) as WithId<T>);
}
