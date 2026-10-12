import type { AdminBackend, Raw } from "./types";

const TTL = 60_000; // a list is reused for a minute; any write by this admin clears it at once

/**
 * Wraps a backend so repeat visits to a screen do not wait for Firestore again.
 * Reads are remembered (and shared if two screens ask at the same moment); writes clear what they touch.
 */
export function withCache(b: AdminBackend): AdminBackend {
  const lists = new Map<string, { at: number; docs: Raw[] }>();
  const pending = new Map<string, Promise<Raw[]>>();
  const fresh = (e?: { at: number }) => !!e && Date.now() - e.at < TTL;
  const clone = (docs: Raw[]) => docs.map((d) => structuredClone(d));
  const forget = (coll: string) => { lists.delete(coll); pending.delete(coll); };

  return {
    ...b,
    async list(coll) {
      const hit = lists.get(coll);
      if (fresh(hit)) return clone(hit!.docs);
      let p = pending.get(coll);
      if (!p) {
        p = b.list(coll).then((docs) => { lists.set(coll, { at: Date.now(), docs }); return docs; }).finally(() => pending.delete(coll));
        pending.set(coll, p);
      }
      return clone(await p);
    },
    async get(coll, id) {
      const hit = lists.get(coll);
      if (fresh(hit)) { const d = hit!.docs.find((x) => x.id === id); if (d) return structuredClone(d); }
      return b.get(coll, id);
    },
    async create(coll, id, data) { await b.create(coll, id, data); forget(coll); },
    async update(coll, id, data) { await b.update(coll, id, data); forget(coll); },
    async remove(coll, id) { await b.remove(coll, id); forget(coll); },
    async signOut() { lists.clear(); pending.clear(); await b.signOut(); },
  };
}

/** Starts loading the main collections in the background so the first visit to each screen is instant. */
export function warmUp(b: AdminBackend) {
  for (const c of ["programmes", "stories", "news", "pages", "team", "partners", "events", "reports"]) b.list(c).catch(() => {});
}
