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

export interface QuestionItem {
  id: string;
  content: string;
  published: string;
  answered: boolean;
  answer?: string;
}

const getLocalQuestions = (): QuestionItem[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("ivan_journal_questions");
  return stored ? JSON.parse(stored) : [];
};

const saveLocalQuestions = (questions: QuestionItem[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("ivan_journal_questions", JSON.stringify(questions));
};

// 1. Submit a new anonymous question (Default: unanswered)
export async function addQuestion(content: string): Promise<QuestionItem> {
  const newQuestion: Omit<QuestionItem, "id"> = {
    content,
    published: new Date().toISOString(),
    answered: false
  };

  if (hasFirebaseKeys) {
    try {
      const docRef = await addDoc(collection(db, "questions"), newQuestion);
      return { id: docRef.id, ...newQuestion };
    } catch (e) {
      console.error("Firebase write error, using localStorage fallback:", e);
    }
  }

  // Fallback Local
  const localQuestions = getLocalQuestions();
  const created: QuestionItem = { id: `q-${Date.now()}`, ...newQuestion };
  localQuestions.push(created);
  saveLocalQuestions(localQuestions);
  return created;
}

// 2. Fetch all questions for Admin Dashboard
export async function getAllQuestionsForAdmin(): Promise<QuestionItem[]> {
  if (hasFirebaseKeys) {
    try {
      const q = query(collection(db, "questions"), orderBy("published", "desc"));
      const querySnapshot = await getDocs(q);
      const items: QuestionItem[] = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as QuestionItem);
      });
      return items;
    } catch (e) {
      console.error("Firebase read error, using localStorage fallback:", e);
    }
  }

  // Fallback Local
  return getLocalQuestions().sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());
}

// 3. Admin answers a question
export async function answerQuestion(id: string, answerText: string): Promise<boolean> {
  if (hasFirebaseKeys) {
    try {
      const docRef = doc(db, "questions", id);
      await updateDoc(docRef, { answered: true, answer: answerText });
      return true;
    } catch (e) {
      console.error("Firebase update error, using localStorage fallback:", e);
    }
  }

  // Fallback Local
  const localQuestions = getLocalQuestions();
  const updated = localQuestions.map(q => q.id === id ? { ...q, answered: true, answer: answerText } : q);
  saveLocalQuestions(updated);
  return true;
}

// 4. Admin deletes a question
export async function deleteQuestion(id: string): Promise<boolean> {
  if (hasFirebaseKeys) {
    try {
      const docRef = doc(db, "questions", id);
      await deleteDoc(docRef);
      return true;
    } catch (e) {
      console.error("Firebase delete error, using localStorage fallback:", e);
    }
  }

  // Fallback Local
  const localQuestions = getLocalQuestions();
  const filtered = localQuestions.filter(q => q.id !== id);
  saveLocalQuestions(filtered);
  return true;
}

// 5. Fetch only Answered Q&As for Public Feed
export async function getAnsweredQuestions(): Promise<QuestionItem[]> {
  if (hasFirebaseKeys) {
    try {
      const q = query(
        collection(db, "questions"), 
        where("answered", "==", true),
        orderBy("published", "desc")
      );
      const querySnapshot = await getDocs(q);
      const items: QuestionItem[] = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as QuestionItem);
      });
      return items;
    } catch (e) {
      console.error("Firebase read error, using localStorage fallback:", e);
    }
  }

  // Fallback Local
  return getLocalQuestions()
    .filter(q => q.answered)
    .sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());
}
