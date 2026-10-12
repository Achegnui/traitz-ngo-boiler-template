import { deleteApp, initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword, getAuth, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut as fbSignOut,
} from "firebase/auth";
import {
  collection, deleteDoc, doc, getCountFromServer, getDoc, getDocs, query, runTransaction, setDoc, where,
} from "firebase/firestore";
import { firebaseConfig, getDb, getFirebaseAuth } from "@/lib/firebase";
import type { AdminRecord, Role } from "@/lib/types";
import type { AdminBackend, Raw, StaffRow } from "./types";
import { uploadToCloudinary } from "./upload";

const randomPassword = () => {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 56]).join("") + "!9";
};

export const firebaseBackend: AdminBackend = {
  subscribe: (cb) => onAuthStateChanged(getFirebaseAuth(), (u) => cb(u ? { uid: u.uid, email: u.email ?? "" } : null)),
  signIn: async (email, password) => { await signInWithEmailAndPassword(getFirebaseAuth(), email, password); },
  signOut: () => fbSignOut(getFirebaseAuth()),
  sendReset: (email) => sendPasswordResetEmail(getFirebaseAuth(), email),
  idToken: async () => {
    const u = getFirebaseAuth().currentUser;
    if (!u) throw new Error("You are signed out. Please sign in again.");
    return u.getIdToken();
  },
  getAdminRecord: async (uid) => {
    const s = await getDoc(doc(getDb(), "admins", uid));
    return s.exists() ? (s.data() as AdminRecord) : null;
  },
  list: async (coll) => (await getDocs(collection(getDb(), coll))).docs.map((d) => ({ ...d.data(), id: d.id })),
  get: async (coll, id) => {
    const s = await getDoc(doc(getDb(), coll, id));
    return s.exists() ? { ...s.data(), id: s.id } : null;
  },
  create: async (coll, id, data) => {
    const ref = doc(getDb(), coll, id);
    await runTransaction(getDb(), async (t) => {
      if ((await t.get(ref)).exists()) throw new Error("Something with this address (slug) already exists. Choose a different one.");
      t.set(ref, data);
    });
  },
  update: (coll, id, data) => setDoc(doc(getDb(), coll, id), data),
  remove: (coll, id) => deleteDoc(doc(getDb(), coll, id)),
  count: async (coll, status) => {
    const c = collection(getDb(), coll);
    return (await getCountFromServer(status ? query(c, where("status", "==", status)) : c)).data().count;
  },
  listStaff: async () =>
    (await getDocs(collection(getDb(), "admins"))).docs.map((d) => ({ ...(d.data() as AdminRecord), uid: d.id }) as StaffRow),
  saveStaff: (uid, record) => setDoc(doc(getDb(), "admins", uid), record),
  removeStaff: (uid) => deleteDoc(doc(getDb(), "admins", uid)),
  createStaffAccount: async (email, displayName, role: Role) => {
    // A second Firebase app creates the account so the administrator stays signed in on the main one.
    const second = initializeApp(firebaseConfig(), `staff-${Date.now()}`);
    let uid: string;
    try {
      const auth2 = getAuth(second);
      const cred = await createUserWithEmailAndPassword(auth2, email, randomPassword());
      uid = cred.user.uid;
      await sendPasswordResetEmail(auth2, email); // the new person sets their own password from this email
      await fbSignOut(auth2);
    } finally {
      await deleteApp(second);
    }
    await setDoc(doc(getDb(), "admins", uid), { email, displayName, role } satisfies AdminRecord);
    return { uid };
  },
  upload: async (file, kind) => uploadToCloudinary(file, kind, await firebaseBackend.idToken()),
};
export type { Raw };
