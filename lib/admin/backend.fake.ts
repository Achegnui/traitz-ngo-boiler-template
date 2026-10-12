/**
 * DEV/TEST ONLY: an in-memory stand-in for Firebase and Cloudinary so the admin UI can be exercised
 * offline (NEXT_PUBLIC_ADMIN_BACKEND=fake). Data lives in sessionStorage. It imitates the role rules
 * but it is NOT a test of firestore.rules.
 */
import { seedDocs } from "@/scripts/seed-data";
import type { AdminRecord, Role } from "@/lib/types";
import type { AdminBackend, Raw, StaffRow, StaffUser } from "./types";

type Db = Record<string, Record<string, Raw>>;
type Account = { uid: string; email: string; password: string };

const ACCOUNTS: Account[] = [
  { uid: "u-admin", email: "admin@example.test", password: "demo-pass-1" },
  { uid: "u-editor", email: "editor@example.test", password: "demo-pass-1" },
  { uid: "u-contrib", email: "contributor@example.test", password: "demo-pass-1" },
  { uid: "u-stranger", email: "stranger@example.test", password: "demo-pass-1" }, // signs in but is not staff
];
const STAFF: Record<string, AdminRecord> = {
  "u-admin": { email: "admin@example.test", displayName: "Demo Admin", role: "administrator" },
  "u-editor": { email: "editor@example.test", displayName: "Demo Editor", role: "editor" },
  "u-contrib": { email: "contributor@example.test", displayName: "Demo Contributor", role: "contributor" },
};

const KEY = "fake-admin-db", USER = "fake-admin-user";
const denied = () => Object.assign(new Error("Missing or insufficient permissions."), { code: "permission-denied" });
let listeners: ((u: StaffUser | null) => void)[] = [];

function load(): Db {
  const raw = typeof sessionStorage !== "undefined" ? sessionStorage.getItem(KEY) : null;
  if (raw) return JSON.parse(raw);
  const db: Db = { admins: structuredClone(STAFF) as unknown as Record<string, Raw>, submissions: {}, donations: {} };
  for (const d of seedDocs) (db[d.collection] ??= {})[d.id] = structuredClone(d.data);
  db.submissions["s1"] = { type: "volunteer", name: "Ngong Ruth", email: "ruth@example.test", phone: "+237 6 00 00 00 01", message: "I would like to volunteer on weekends.", createdAt: "2026-09-30T10:12:00Z", handled: false };
  db.submissions["s2"] = { type: "contact", name: "Tchinda Paul", email: "paul@example.test", phone: "", message: "Do you accept donations by cheque?", createdAt: "2026-09-28T08:00:00Z", handled: true };
  db.donations["d1"] = { amount: 5000, currency: "XAF", donorName: "Anonymous", donorEmail: "", frequency: "one-time", status: "completed", createdAt: "2026-09-29T12:00:00Z" };
  return db;
}
const save = (db: Db) => sessionStorage.setItem(KEY, JSON.stringify(db));
const current = (): StaffUser | null => { const r = sessionStorage.getItem(USER); return r ? JSON.parse(r) : null; };
const emit = () => listeners.forEach((l) => l(current()));
const role = (): Role | null => { const u = current(); return u ? (load().admins[u.uid]?.role ?? null) : null; };
const isEditor = () => role() === "administrator" || role() === "editor";
const CONTENT = ["pages", "programmes", "stories", "news", "events", "reports", "team", "partners"];

const LAG = Number(process.env.NEXT_PUBLIC_FAKE_LATENCY_MS ?? 0);
const lag = () => (LAG ? new Promise((r) => setTimeout(r, LAG)) : undefined);
const base: AdminBackend = {
  subscribe(cb) {
    listeners.push(cb);
    queueMicrotask(() => cb(current()));
    return () => { listeners = listeners.filter((l) => l !== cb); };
  },
  async signIn(email, password) {
    const a = ACCOUNTS.find((x) => x.email === email.trim().toLowerCase());
    if (!a || a.password !== password) throw Object.assign(new Error("bad credentials"), { code: "auth/invalid-credential" });
    sessionStorage.setItem(USER, JSON.stringify({ uid: a.uid, email: a.email }));
    emit();
  },
  async signOut() { sessionStorage.removeItem(USER); emit(); },
  async sendReset() { /* pretend */ },
  async idToken() { return "fake-token"; },
  async getAdminRecord(uid) { return (load().admins[uid] as AdminRecord) ?? null; },
  async list(coll) {
    if (coll === "admins" && role() !== "administrator") throw denied();
    if (["submissions", "donations"].includes(coll) && !isEditor()) throw denied();
    return Object.entries(load()[coll] ?? {}).map(([id, d]) => ({ ...structuredClone(d), id }));
  },
  async get(coll, id) { const d = load()[coll]?.[id]; return d ? { ...structuredClone(d), id } : null; },
  async create(coll, id, data) {
    const db = load();
    if (CONTENT.includes(coll) && !isEditor() && data.status !== "draft") throw denied();
    if (db[coll]?.[id]) throw new Error("Something with this address (slug) already exists. Choose a different one.");
    (db[coll] ??= {})[id] = structuredClone(data); save(db);
  },
  async update(coll, id, data) {
    const db = load(); const old = db[coll]?.[id];
    if (CONTENT.includes(coll) && !isEditor() && !(old?.status === "draft" && data.status === "draft")) throw denied();
    if (coll === "settings" && !isEditor()) throw denied();
    (db[coll] ??= {})[id] = structuredClone(data); save(db);
  },
  async remove(coll, id) {
    if (!isEditor()) throw denied();
    const db = load(); delete db[coll]?.[id]; save(db);
  },
  async count(coll, status) {
    const items = Object.values(load()[coll] ?? {});
    return status ? items.filter((d) => d.status === status).length : items.length;
  },
  async listStaff() {
    if (role() !== "administrator") throw denied();
    return Object.entries(load().admins).map(([uid, r]) => ({ ...(r as unknown as AdminRecord), uid }) as StaffRow);
  },
  async saveStaff(uid, record) {
    if (role() !== "administrator") throw denied();
    const db = load(); db.admins[uid] = record as unknown as Raw; save(db);
  },
  async removeStaff(uid) {
    if (role() !== "administrator") throw denied();
    const db = load(); delete db.admins[uid]; save(db);
  },
  async createStaffAccount(email, displayName, r) {
    if (role() !== "administrator") throw denied();
    const uid = "u-" + Math.random().toString(36).slice(2, 8);
    const db = load(); db.admins[uid] = { email, displayName, role: r }; save(db);
    return { uid };
  },
  async upload(file) {
    // no network: embed the file so previews and validation can still be exercised
    const url = await new Promise<string>((res, rej) => { const f = new FileReader(); f.onload = () => res(f.result as string); f.onerror = rej; f.readAsDataURL(file); });
    return { url, bytes: file.size };
  },
};

/** Simulated network round trips (NEXT_PUBLIC_FAKE_LATENCY_MS) so speed work can be measured offline. */
const SLOW = ["list", "get", "create", "update", "remove", "count", "listStaff", "saveStaff", "removeStaff", "getAdminRecord"] as const;
export const fakeBackend: AdminBackend = { ...base };
for (const k of SLOW) {
  const f = base[k] as (...a: never[]) => Promise<unknown>;
  (fakeBackend as unknown as Record<string, unknown>)[k] = async (...a: never[]) => { await lag(); return f(...a); };
}
