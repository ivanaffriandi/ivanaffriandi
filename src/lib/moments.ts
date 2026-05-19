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
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return { url, storagePath: path };
    } catch (e) {
      console.error("Firebase Storage error:", e);
      throw e;
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
      const docRef = await addDoc(collection(db, "moments"), newItem);
      return { id: docRef.id, ...newItem };
    } catch (e) {
      console.error("Firebase Firestore error:", e);
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
      const querySnapshot = await getDocs(q);
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
        await deleteObject(storageRef).catch(e => console.warn("Failed to delete storage file (maybe already deleted?):", e));
      }
      const docRef = doc(db, "moments", id);
      await deleteDoc(docRef);
      return true;
    } catch (e) {
      console.error("Firebase delete error:", e);
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
