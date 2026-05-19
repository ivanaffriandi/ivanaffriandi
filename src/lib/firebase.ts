import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup as firebaseSignIn, signOut as firebaseSignOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Enforced real production keys directly to allow standard public browser connections to Firestore
const hasFirebaseKeys = true;

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
