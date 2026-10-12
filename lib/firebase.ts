import { getApp, getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

/**
 * The only place Firebase is initialised. Config comes from NEXT_PUBLIC_FIREBASE_* (see .env.example),
 * never from literals. Initialisation is lazy so importing this file costs nothing until Firebase is used.
 * Auth lives here too; uploads go to Cloudinary, not Firebase Storage.
 */
export function firebaseConfig(): FirebaseOptions {
  const c: FirebaseOptions = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  const missing = Object.entries(c).filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) {
    throw new Error(`Missing Firebase config (${missing.join(", ")}). Copy .env.example to .env.local and fill it in.`);
  }
  return c;
}

export function getFirebaseApp(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(firebaseConfig());
}

export function getDb(): Firestore {
  return getFirestore(getFirebaseApp());
}

/** Browser-only (admin). Uses the same app as Firestore. */
export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}
