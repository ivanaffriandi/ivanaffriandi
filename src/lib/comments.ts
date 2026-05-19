import { db, hasFirebaseKeys } from "./firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  doc, 
  updateDoc, 
  deleteDoc 
} from "firebase/firestore";

export interface CommentItem {
  id: string;
  postId: string;
  published: string;
  content: string;
  approved: boolean;
  reply?: string;
  author: {
    displayName: string;
    email: string;
    image: { url: string };
  };
}

// Fallback LocalStorage untuk menjamin kelancaran offline/local development tanpa Firebase keys
const getLocalComments = (): CommentItem[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("ivan_journal_comments");
  return stored ? JSON.parse(stored) : [];
};

const saveLocalComments = (comments: CommentItem[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("ivan_journal_comments", JSON.stringify(comments));
};

// 1. Tambah Komentar Baru (Default: Pending Approval)
export async function addComment(
  postId: string, 
  authorName: string, 
  authorEmail: string, 
  content: string
): Promise<CommentItem> {
  const newComment: Omit<CommentItem, "id"> = {
    postId,
    published: new Date().toISOString(),
    content,
    approved: false, // Wajib diapprove admin dulu
    author: {
      displayName: authorName,
      email: authorEmail,
      image: { url: `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=E2DDD5&color=333` }
    }
  };

  if (hasFirebaseKeys) {
    try {
      const docRef = await addDoc(collection(db, "comments"), newComment);
      return { id: docRef.id, ...newComment };
    } catch (e) {
      console.error("Firebase write error, using localStorage fallback:", e);
    }
  }

  // Fallback Local
  const localComments = getLocalComments();
  const created: CommentItem = { id: `local-${Date.now()}`, ...newComment };
  localComments.push(created);
  saveLocalComments(localComments);
  return created;
}

// 2. Mengambil Komentar yang SUDAH DI-APPROVE untuk ditampilkan di Blog
export async function getApprovedComments(postId: string): Promise<CommentItem[]> {
  if (hasFirebaseKeys) {
    try {
      const q = query(
        collection(db, "comments"), 
        where("postId", "==", postId),
        where("approved", "==", true),
        orderBy("published", "asc")
      );
      const querySnapshot = await getDocs(q);
      const items: CommentItem[] = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as CommentItem);
      });
      return items;
    } catch (e) {
      console.error("Firebase read error, using localStorage fallback:", e);
    }
  }

  // Fallback Local
  return getLocalComments().filter(c => c.postId === postId && c.approved);
}

// 3. Mengambil SEMUA Komentar untuk dimoderasi oleh Admin
export async function getAllCommentsForAdmin(): Promise<CommentItem[]> {
  if (hasFirebaseKeys) {
    try {
      const q = query(collection(db, "comments"), orderBy("published", "desc"));
      const querySnapshot = await getDocs(q);
      const items: CommentItem[] = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as CommentItem);
      });
      return items;
    } catch (e) {
      console.error("Firebase read error, using localStorage fallback:", e);
    }
  }

  // Fallback Local
  return getLocalComments().sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());
}

// 4. Admin menyetujui Komentar (Approve)
export async function approveComment(commentId: string): Promise<boolean> {
  if (hasFirebaseKeys) {
    try {
      const docRef = doc(db, "comments", commentId);
      await updateDoc(docRef, { approved: true });
      return true;
    } catch (e) {
      console.error("Firebase update error, using localStorage fallback:", e);
    }
  }

  // Fallback Local
  const localComments = getLocalComments();
  const updated = localComments.map(c => c.id === commentId ? { ...c, approved: true } : c);
  saveLocalComments(updated);
  return true;
}

// 5. Admin menghapus Komentar (Delete)
export async function deleteComment(commentId: string): Promise<boolean> {
  if (hasFirebaseKeys) {
    try {
      const docRef = doc(db, "comments", commentId);
      await deleteDoc(docRef);
      return true;
    } catch (e) {
      console.error("Firebase delete error, using localStorage fallback:", e);
    }
  }

  // Fallback Local
  const localComments = getLocalComments();
  const filtered = localComments.filter(c => c.id !== commentId);
  saveLocalComments(filtered);
  return true;
}

// 6. Admin membalas Komentar (Reply)
export async function replyComment(commentId: string, replyText: string): Promise<boolean> {
  if (hasFirebaseKeys) {
    try {
      const docRef = doc(db, "comments", commentId);
      await updateDoc(docRef, { reply: replyText });
      return true;
    } catch (e) {
      console.error("Firebase update error, using localStorage fallback:", e);
    }
  }

  // Fallback Local
  const localComments = getLocalComments();
  const updated = localComments.map(c => c.id === commentId ? { ...c, reply: replyText } : c);
  saveLocalComments(updated);
  return true;
}

