import { cert, getApp, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

/** Raised when the server-side Firebase credentials are missing or malformed. Routes turn it into a 503. */
export class AdminConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminConfigError";
  }
}

export type AdminCredentials = { projectId: string; clientEmail: string; privateKey: string };

/**
 * Reads the service account from the environment. The project id is shared with the browser config
 * (NEXT_PUBLIC_FIREBASE_PROJECT_ID); only the e-mail and private key are secret. The private key may be
 * stored with literal "\n" sequences, which are turned back into line breaks here.
 */
export function readAdminCredentials(env: Record<string, string | undefined> = process.env): AdminCredentials {
  const projectId = env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  const clientEmail = env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim();
  const privateKey = env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n").trim();
  const missing = [
    !projectId && "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    !clientEmail && "FIREBASE_ADMIN_CLIENT_EMAIL",
    !privateKey && "FIREBASE_ADMIN_PRIVATE_KEY",
  ].filter(Boolean);
  if (missing.length || !projectId || !clientEmail || !privateKey) {
    throw new AdminConfigError(`Firebase Admin is not set up: missing ${missing.join(", ")}. See .env.example.`);
  }
  if (!privateKey.includes("BEGIN PRIVATE KEY")) {
    throw new AdminConfigError("FIREBASE_ADMIN_PRIVATE_KEY does not look like a service account private key (expected a PEM block).");
  }
  return { projectId, clientEmail, privateKey };
}

/** Lazy, so importing this file costs nothing and a missing key only fails the routes that need it. */
export function getAdminApp(): App {
  return getApps().length ? getApp() : initializeApp({ credential: cert(readAdminCredentials()) });
}

/** Server only. The Admin SDK bypasses Firestore rules, which is why /donations rules deny every browser write. */
export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}
