export interface QuestionItem {
  id: string;
  content: string;
  published: string;
  answered: boolean;
  answer?: string;
}

// 1. Submit a new anonymous question (Default: unanswered)
export async function addQuestion(content: string): Promise<QuestionItem> {
  const res = await fetch("/api/questions", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache"
    },
    body: JSON.stringify({ content })
  });
  if (!res.ok) throw new Error("Failed to submit question");
  return res.json();
}

// 2. Fetch all questions for Admin Dashboard (Bypass Cache completely!)
export async function getAllQuestionsForAdmin(): Promise<QuestionItem[]> {
  const res = await fetch(`/api/questions?t=${Date.now()}`, {
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache",
      "Pragma": "no-cache"
    }
  });
  if (!res.ok) throw new Error("Failed to load admin questions");
  return res.json();
}

// 3. Admin answers a question
export async function answerQuestion(id: string, answerText: string): Promise<boolean> {
  const res = await fetch("/api/questions", {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache"
    },
    body: JSON.stringify({ id, answerText })
  });
  if (!res.ok) return false;
  const data = await res.json();
  return data.success === true;
}

// 4. Admin deletes a question
export async function deleteQuestion(id: string): Promise<boolean> {
  const res = await fetch(`/api/questions?id=${id}&t=${Date.now()}`, {
    method: "DELETE",
    headers: {
      "Cache-Control": "no-cache",
      "Pragma": "no-cache"
    }
  });
  if (!res.ok) return false;
  const data = await res.json();
  return data.success === true;
}

// 5. Fetch only Answered Q&As for Public Feed (Bypass Cache completely!)
export async function getAnsweredQuestions(): Promise<QuestionItem[]> {
  const res = await fetch(`/api/questions?answered=true&t=${Date.now()}`, {
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache",
      "Pragma": "no-cache"
    }
  });
  if (!res.ok) return [];
  return res.json();
}
