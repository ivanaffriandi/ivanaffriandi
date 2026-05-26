import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const FIREBASE_DB_URL = "https://ivan-affriandi-default-rtdb.asia-southeast1.firebasedatabase.app/books";

async function verifyAdminAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  return session?.value === "authenticated_ivan_exclusive";
}

async function readBooksList(): Promise<any[]> {
  try {
    const res = await fetch(`${FIREBASE_DB_URL}.json`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data) return [];
    return Object.entries(data).map(([id, val]: [string, any]) => ({ id, ...val }));
  } catch (err) {
    console.error("Read books Firebase error:", err);
    return [];
  }
}

// GET: Fetch all books
export async function GET() {
  try {
    const items = await readBooksList();
    
    // Sort: reading first, then others, sorted by startedAt or completedAt desc
    items.sort((a, b) => {
      if (a.status === "reading" && b.status !== "reading") return -1;
      if (a.status !== "reading" && b.status === "reading") return 1;
      const dateA = new Date(a.completedAt || a.startedAt || 0).getTime();
      const dateB = new Date(b.completedAt || b.startedAt || 0).getTime();
      return dateB - dateA;
    });

    return NextResponse.json(items);
  } catch (err) {
    console.error("GET Books API error:", err);
    return NextResponse.json([]);
  }
}

// POST: Add a new book (Admin only)
export async function POST(request: Request) {
  try {
    if (!(await verifyAdminAuth())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const { title, author, coverUrl, progress, status, review, startedAt, completedAt } = body;

    if (!title || !author) {
      return NextResponse.json({ error: "title and author are required" }, { status: 400 });
    }

    const newBook = {
      title,
      author,
      coverUrl: coverUrl || "",
      progress: progress ?? 0,
      status: status || "to_read",
      review: review || "",
      startedAt: startedAt || new Date().toISOString(),
      completedAt: completedAt || ""
    };

    const res = await fetch(`${FIREBASE_DB_URL}.json`, {
      method: "POST",
      body: JSON.stringify(newBook),
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) throw new Error("Failed to write book to Firebase");
    const result = await res.json();

    return NextResponse.json({ id: result.name, ...newBook });
  } catch (err) {
    console.error("POST Book API error:", err);
    return NextResponse.json({ error: "Failed to add book" }, { status: 500 });
  }
}

// PATCH: Update a book (Admin only)
export async function PATCH(request: Request) {
  try {
    if (!(await verifyAdminAuth())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const res = await fetch(`${FIREBASE_DB_URL}/${id}.json`, {
      method: "PATCH",
      body: JSON.stringify(updates),
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) throw new Error("Failed to update book in Firebase");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH Book API error:", err);
    return NextResponse.json({ error: "Failed to update book" }, { status: 500 });
  }
}

// DELETE: Remove a book (Admin only)
export async function DELETE(request: Request) {
  try {
    if (!(await verifyAdminAuth())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const res = await fetch(`${FIREBASE_DB_URL}/${id}.json`, { method: "DELETE" });

    if (!res.ok) throw new Error("Failed to delete book from Firebase");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE Book API error:", err);
    return NextResponse.json({ error: "Failed to delete book" }, { status: 500 });
  }
}
