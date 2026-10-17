import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { getDb } from "@/lib/firebase";

export type WithId<T> = T & { id: string };

/** DATA_SOURCE=local serves the bundled seed data (offline dev, CI). Anything else reads Firestore. */
const useLocal = () => process.env.DATA_SOURCE === "local";
const denied = (e: unknown) => (e as { code?: string } | null)?.code === "permission-denied";

/** Every Firestore read gives up after this long, so a dead connection cannot hang a page or the build. */
const READ_TIMEOUT_MS = 8000;

/**
 * True only while `next build` prerenders. There a failed read falls back to the bundled default content so the
 * build can finish. At runtime the error propagates, so Next keeps serving the last good page and retries.
 */
const duringBuild = () => process.env.NEXT_PHASE === "phase-production-build";

/** Set once a build-time read has fallen back. Later reads in this process skip the network instead of waiting 8s each. */
let buildFellBack = false;

/** True when this build process served bundled default content instead of Firestore (generateStaticParams then returns []). */
export const servedFallback = () => buildFellBack;

function fellBack(what: string, e: unknown) {
  if (!buildFellBack) {
    console.warn(
      `[data] build: Firestore read failed (${what}: ${e instanceof Error ? e.message : String(e)}). ` +
        "Using bundled default content for this build. Pages refresh from Firestore after deploy (revalidate 60s).",
    );
  }
  buildFellBack = true;
}

function withTimeout<T>(p: Promise<T>, what: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Firestore read timed out after ${READ_TIMEOUT_MS / 1000}s (${what})`)), READ_TIMEOUT_MS);
  });
  return Promise.race([p, timeout]).finally(() => clearTimeout(timer));
}

async function localDoc<T>(coll: string, id: string): Promise<WithId<T> | null> {
  const { seedDocs } = await import("@/scripts/seed-data");
  const d = seedDocs.find((x) => x.collection === coll && x.id === id);
  return d ? ({ ...structuredClone(d.data), id } as WithId<T>) : null;
}

async function localPublished<T>(coll: string): Promise<WithId<T>[]> {
  const { seedDocs } = await import("@/scripts/seed-data");
  return seedDocs
    .filter((x) => x.collection === coll && x.data.status === "published")
    .map((x) => ({ ...structuredClone(x.data), id: x.id }) as WithId<T>);
}

/** One document by id, or null if it does not exist or the rules hide it (e.g. a draft). */
export async function readDoc<T>(coll: string, id: string): Promise<WithId<T> | null> {
  if (useLocal() || (duringBuild() && buildFellBack)) return localDoc<T>(coll, id);
  try {
    const snap = await withTimeout(getDoc(doc(getDb(), coll, id)), `${coll}/${id}`);
    return snap.exists() ? ({ ...snap.data(), id: snap.id } as WithId<T>) : null;
  } catch (e) {
    if (denied(e)) return null;
    if (duringBuild()) {
      fellBack(`${coll}/${id}`, e);
      return localDoc<T>(coll, id);
    }
    throw e;
  }
}

/**
 * Every published document in a collection, unordered. Filtering on status here (and again in the
 * security rules) means no composite index is needed: callers sort in memory, which is fine at NGO scale.
 */
export async function readPublished<T>(coll: string): Promise<WithId<T>[]> {
  if (useLocal() || (duringBuild() && buildFellBack)) return localPublished<T>(coll);
  try {
    const snap = await withTimeout(getDocs(query(collection(getDb(), coll), where("status", "==", "published"))), coll);
    // Offline, getDocs does not fail: it answers from the (empty) local cache. That is not the real collection, so it
    // counts as a failed read. Otherwise a blank list would be prerendered, or cached as a blank page at runtime.
    if (snap.metadata.fromCache) throw new Error(`Firestore is offline (${coll} was answered from the local cache)`);
    return snap.docs.map((d) => ({ ...d.data(), id: d.id }) as WithId<T>);
  } catch (e) {
    if (duringBuild()) {
      fellBack(coll, e);
      return localPublished<T>(coll);
    }
    throw e;
  }
}
