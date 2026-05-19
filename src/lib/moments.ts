import { db, storage, hasFirebaseKeys } from "./firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  deleteDoc 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

export interface MomentItem {
  id: string;
  url: string;
  title: string;
  story?: string;
  date: string;
  location: string;
  published: string;
  storagePath?: string; // Tracks the location in Firebase Storage for deletion
  showOnHomepage?: boolean;
  homepageOrder?: number;
}

// Fallback logic for LocalStorage Base64 URLs if Firebase API Keys are missing locally
const getLocalMoments = (): MomentItem[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("ivan_journal_moments");
  return stored ? JSON.parse(stored) : [];
};

const saveLocalMoments = (moments: MomentItem[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("ivan_journal_moments", JSON.stringify(moments));
};

export async function uploadMomentPhoto(file: File, path: string): Promise<{ url: string, storagePath: string }> {
  if (hasFirebaseKeys) {
    try {
      const storageRef = ref(storage, path);
      // Run storage upload & url fetching with a 3.5s race timeout
      const url = await Promise.race([
        (async () => {
          await uploadBytes(storageRef, file);
          return await getDownloadURL(storageRef);
        })(),
        new Promise<string>((_, reject) => setTimeout(() => reject(new Error("Firebase Storage timeout")), 3500))
      ]);
      return { url, storagePath: path };
    } catch (e) {
      console.warn("Firebase Storage failed or timed out, falling back to Local Base64:", e);
      // Fallback seamlessly to Base64 convert below
    }
  }
  
  // Fallback: convert file to Base64
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ url: reader.result as string, storagePath: "" });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function addMoment(momentData: Omit<MomentItem, "id" | "published">): Promise<MomentItem> {
  const newItem: Omit<MomentItem, "id"> = {
    ...momentData,
    published: new Date().toISOString()
  };

  if (hasFirebaseKeys) {
    try {
      // Run firestore addDoc with a 3.5s race timeout
      const docRef = await Promise.race([
        addDoc(collection(db, "moments"), newItem),
        new Promise<any>((_, reject) => setTimeout(() => reject(new Error("Firestore timeout")), 3500))
      ]);
      return { id: docRef.id, ...newItem };
    } catch (e) {
      console.warn("Firebase Firestore failed or timed out, falling back to LocalStorage:", e);
      // Fallback seamlessly to LocalStorage below
    }
  }

  const localMoments = getLocalMoments();
  const created: MomentItem = { id: `m-${Date.now()}`, ...newItem };
  localMoments.push(created);
  saveLocalMoments(localMoments);
  return created;
}

export async function getAllMoments(): Promise<MomentItem[]> {
  if (hasFirebaseKeys) {
    try {
      const q = query(collection(db, "moments"), orderBy("published", "desc"));
      
      // Enforce a strict 3-second timeout to prevent UI hangs
      const querySnapshot = await Promise.race([
        getDocs(q),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Firestore timeout")), 3000))
      ]);

      const items: MomentItem[] = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as MomentItem);
      });
      return items;
    } catch (e) {
      console.error("Firebase read error, fallback to local:", e);
    }
  }

  return getLocalMoments().sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());
}

export async function deleteMoment(id: string, storagePath?: string): Promise<boolean> {
  if (hasFirebaseKeys) {
    try {
      if (storagePath) {
        const storageRef = ref(storage, storagePath);
        await Promise.race([
          deleteObject(storageRef),
          new Promise<void>((_, reject) => setTimeout(() => reject(new Error("Storage delete timeout")), 3500))
        ]).catch(e => console.warn("Failed or timed out deleting storage file:", e));
      }
      const docRef = doc(db, "moments", id);
      await Promise.race([
        deleteDoc(docRef),
        new Promise<void>((_, reject) => setTimeout(() => reject(new Error("Firestore delete timeout")), 3500))
      ]);
      return true;
    } catch (e) {
      console.error("Firebase delete error, using local fallback:", e);
    }
  }

  const localMoments = getLocalMoments();
  const filtered = localMoments.filter(m => m.id !== id);
  saveLocalMoments(filtered);
  return true;
}

export async function updateMoment(id: string, data: Partial<MomentItem>): Promise<boolean> {
  if (hasFirebaseKeys) {
    try {
      const docRef = doc(db, "moments", id);
      await updateDoc(docRef, data);
      return true;
    } catch (e) {
      console.error("Firebase update error:", e);
    }
  }

  const localMoments = getLocalMoments();
  const updated = localMoments.map(m => m.id === id ? { ...m, ...data } : m);
  saveLocalMoments(updated);
  return true;
}
