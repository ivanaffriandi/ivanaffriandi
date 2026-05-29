import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Silence Firebase SDK connection warnings globally by filtering console outputs
if (typeof window !== "undefined") {
  const filterMsg = (args: any[]) =>
    args.map(x => (typeof x === "string" ? x : (x?.message || x?.toString?.() || ""))).join(" ");

  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    const msg = filterMsg(args);
    if (msg.includes("firestore") || msg.includes("Firestore")) return;
    originalWarn(...args);
  };

  const originalError = console.error;
  console.error = (...args: any[]) => {
    const msg = filterMsg(args);
    if (msg.includes("firestore") || msg.includes("Firestore") || msg.includes("Cloud Firestore")) return;
    originalError(...args);
  };
}

const firebaseConfig = {
  apiKey: "AIzaSyBVRIwhZ3CXTJLdbp4ma15XMXYfhWa_iPw",
  authDomain: "ivan-affriandi.firebaseapp.com",
  projectId: "ivan-affriandi",
  storageBucket: "ivan-affriandi.firebasestorage.app",
  messagingSenderId: "19364784137",
  appId: "1:19364784137:web:2dc1ec676be324484ce9eb"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result;
  } catch (err: any) {
    throw new Error(err?.message ?? "Firebase sign-in failed");
  }
};

export const logOut = async () => firebaseSignOut(auth);

// Keep hasFirebaseKeys = true so callers don't need changing
export const hasFirebaseKeys = true;
export { app, auth, db, storage };
