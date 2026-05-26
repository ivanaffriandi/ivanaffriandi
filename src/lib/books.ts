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

// Minimal aesthetic fallback books list to ensure page has gorgeous content out of the box!
export function getFallbackBooks(): BookItem[] {
  return [
    {
      id: "fallback-1",
      title: "Designing Design",
      author: "Kenya Hara",
      progress: 68,
      status: "reading",
      coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=250&auto=format&fit=crop",
      startedAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: "fallback-2",
      title: "Grid Systems in Graphic Design",
      author: "Josef Müller-Brockmann",
      progress: 100,
      status: "completed",
      coverUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=250&auto=format&fit=crop",
      startedAt: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString(),
      review: "A timeless masterpiece that lays the foundations of visual alignment and structural typography. Absolute bible for design engineering.",
      rating: 5
    },
    {
      id: "fallback-3",
      title: "Less and More: The Design Ethos of Dieter Rams",
      author: "Klaus Klemp",
      progress: 100,
      status: "completed",
      coverUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=250&auto=format&fit=crop",
      startedAt: new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 70 * 24 * 3600 * 1000).toISOString(),
      review: "Stunning exploration of functional minimalism. Rams' ten principles are incredibly well detailed and highly relevant for modern digital design.",
      rating: 5
    }
  ];
}
