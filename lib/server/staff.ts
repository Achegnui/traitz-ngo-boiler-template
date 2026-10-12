import type { Role } from "@/lib/types";

export type Staff = { uid: string; email: string; role: Role };

// Overridable so the checks can be tested against a stand-in server.
const IDENTITY = process.env.FIREBASE_IDENTITY_URL ?? "https://identitytoolkit.googleapis.com";
const FIRESTORE = process.env.FIREBASE_FIRESTORE_URL ?? "https://firestore.googleapis.com";
const ROLES: Role[] = ["administrator", "editor", "contributor"];

/**
 * Who is calling? Needs no service account: Google confirms the ID token is genuine (accounts:lookup),
 * then we read admins/{uid} *as that user*, so the Firestore rules decide whether the record is visible.
 * Returns null unless the caller is a signed-in member of staff.
 */
export async function verifyStaff(req: Request): Promise<Staff | null> {
  const token = /^Bearer (.+)$/.exec(req.headers.get("authorization") ?? "")?.[1];
  const key = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const project = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!token || !key || !project) return null;
  try {
    const lookup = await fetch(`${IDENTITY}/v1/accounts:lookup?key=${key}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idToken: token }), cache: "no-store",
    });
    if (!lookup.ok) return null;
    const user = (await lookup.json()).users?.[0];
    if (!user?.localId || user.disabled) return null;
    const doc = await fetch(`${FIRESTORE}/v1/projects/${project}/databases/(default)/documents/admins/${user.localId}`, {
      headers: { Authorization: `Bearer ${token}` }, cache: "no-store",
    });
    if (!doc.ok) return null;
    const role = (await doc.json()).fields?.role?.stringValue as Role | undefined;
    return role && ROLES.includes(role) ? { uid: user.localId, email: user.email ?? "", role } : null;
  } catch {
    return null;
  }
}
