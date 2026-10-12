import type { AdminRecord, Role } from "@/lib/types";

export type Raw = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
export type StaffUser = { uid: string; email: string };
export type StaffRow = AdminRecord & { uid: string };
export type UploadKind = "image" | "file";

/** Everything the admin UI needs from the outside world. Real: Firebase + Cloudinary. Fake: in memory (tests). */
export interface AdminBackend {
  subscribe(cb: (user: StaffUser | null) => void): () => void;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  sendReset(email: string): Promise<void>;
  idToken(): Promise<string>;
  getAdminRecord(uid: string): Promise<AdminRecord | null>;
  list(collection: string): Promise<Raw[]>; // each item includes `id`
  get(collection: string, id: string): Promise<Raw | null>;
  create(collection: string, id: string, data: Raw): Promise<void>; // fails if the id exists
  update(collection: string, id: string, data: Raw): Promise<void>;
  remove(collection: string, id: string): Promise<void>;
  count(collection: string, status?: "draft" | "published"): Promise<number>;
  listStaff(): Promise<StaffRow[]>;
  saveStaff(uid: string, record: AdminRecord): Promise<void>;
  removeStaff(uid: string): Promise<void>;
  createStaffAccount(email: string, displayName: string, role: Role): Promise<{ uid: string }>;
  upload(file: File, kind: UploadKind): Promise<{ url: string; bytes: number }>;
}

export const ROLE_LABEL: Record<Role, string> = { administrator: "Administrator", editor: "Editor", contributor: "Contributor" };

/** What each role may do. Mirrors firestore.rules, which is what actually enforces it. */
export const can = {
  publish: (r: Role) => r === "administrator" || r === "editor",
  remove: (r: Role) => r === "administrator" || r === "editor",
  editSite: (r: Role) => r === "administrator" || r === "editor",
  viewInbox: (r: Role) => r === "administrator" || r === "editor",
  manageStaff: (r: Role) => r === "administrator",
};
