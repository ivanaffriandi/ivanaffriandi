import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup as firebaseSignIn, signOut as firebaseSignOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Cek apakah User sudah mengisi API Key di .env.local
const hasFirebaseKeys = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "mock-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "mock-domain.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mock-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "mock-bucket.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "0000000000",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:0000000:web:0000000"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  if (!hasFirebaseKeys) {
    console.warn("⚠️ No Firebase keys found. Using simulated login for testing UI.");
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      user: { email: "hello@ivanaffriandi.com", displayName: "Ivan Affriandi", photoURL: "/profile.jpg" }
    };
  }
  return firebaseSignIn(auth, provider);
};

export const logOut = async () => {
  if (!hasFirebaseKeys) return;
  return firebaseSignOut(auth);
};

export { app, auth, db, storage, hasFirebaseKeys };
