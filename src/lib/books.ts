import booksData from "../data/books.json";

export interface BookItem {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  progress: number; // 0 to 100
  status: "reading" | "completed" | "on_hold" | "to_read";
  review?: string;
  rating?: number; // 1 to 5
  startedAt?: string;
  completedAt?: string;
}

// 1. Fetch all books (with cache bypassing)
export async function getAllBooks(): Promise<BookItem[]> {
  try {
    const res = await fetch(`/api/books?t=${Date.now()}`, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
      }
    });
    if (!res.ok) return getFallbackBooks();
    const data = await res.json();
    if (!data || data.length === 0) return getFallbackBooks();
    return data;
  } catch (err) {
    console.error("Failed to load books:", err);
    return getFallbackBooks();
  }
}

// 2. Add a new book (Admin only)
export async function addBook(book: Omit<BookItem, "id">): Promise<BookItem | null> {
  const res = await fetch("/api/books", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache"
    },
    body: JSON.stringify(book)
  });
  if (!res.ok) return null;
  return res.json();
}

// 3. Update a book (Admin only)
export async function updateBook(id: string, updates: Partial<BookItem>): Promise<boolean> {
  const res = await fetch("/api/books", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache"
    },
    body: JSON.stringify({ id, ...updates })
  });
  if (!res.ok) return false;
  const data = await res.json();
  return data.success === true;
}

// 4. Delete a book (Admin only)
export async function deleteBook(id: string): Promise<boolean> {
  const res = await fetch(`/api/books?id=${id}&t=${Date.now()}`, {
    method: "DELETE",
    headers: {
      "Cache-Control": "no-cache"
    }
  });
  if (!res.ok) return false;
  const data = await res.json();
  return data.success === true;
}

// Complete curated library — politics, queer lit, religion, novels, mycology, self-improvement, design, science
export function getFallbackBooks(): BookItem[] {
  return booksData as BookItem[];
}

