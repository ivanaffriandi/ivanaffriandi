import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";

const BOOKS_FILE_PATH = path.join(process.cwd(), "src/data/books.json");

async function verifyAdminAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  return session?.value === "authenticated_ivan_exclusive";
}

function readBooksLocal(): any[] {
  try {
    if (!fs.existsSync(BOOKS_FILE_PATH)) {
      return [];
    }
    const raw = fs.readFileSync(BOOKS_FILE_PATH, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Read local books error:", err);
    return [];
  }
}

function writeBooksLocal(books: any[]): boolean {
  try {
    const dir = path.dirname(BOOKS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(BOOKS_FILE_PATH, JSON.stringify(books, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("Write local books error:", err);
    return false;
  }
}

// GET: Fetch all books from local file
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const items = readBooksLocal();
    
    // Sort: reading first, then others, sorted by startedAt or completedAt desc
    items.sort((a: any, b: any) => {
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

// POST: Add a new book locally (Admin only)
export async function POST(request: Request) {
  try {
    if (!(await verifyAdminAuth())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const { title, author, coverUrl, progress, status, review, rating, startedAt, completedAt } = body;

    if (!title || !author) {
      return NextResponse.json({ error: "title and author are required" }, { status: 400 });
    }

    const items = readBooksLocal();
    const newId = String(Date.now());

    const newBook = {
      id: newId,
      title,
      author,
      coverUrl: coverUrl || "",
      progress: progress ?? 0,
      status: status || "to_read",
      review: review || "",
      rating: rating ?? 5,
      startedAt: startedAt || new Date().toISOString(),
      completedAt: completedAt || ""
    };

    items.push(newBook);
    const success = writeBooksLocal(items);
    if (!success) {
      return NextResponse.json({ error: "Failed to write database file" }, { status: 500 });
    }

    return NextResponse.json(newBook);
  } catch (err) {
    console.error("POST Book API error:", err);
    return NextResponse.json({ error: "Failed to add book" }, { status: 500 });
  }
}

// PATCH: Update a book locally (Admin only)
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

    const items = readBooksLocal();
    const index = items.findIndex((b: any) => b.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    items[index] = {
      ...items[index],
      ...updates
    };

    const success = writeBooksLocal(items);
    if (!success) {
      return NextResponse.json({ error: "Failed to write database file" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH Book API error:", err);
    return NextResponse.json({ error: "Failed to update book" }, { status: 500 });
  }
}

// DELETE: Remove a book locally (Admin only)
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

    let items = readBooksLocal();
    const initialLength = items.length;
    items = items.filter((b: any) => b.id !== id);

    if (items.length === initialLength) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const success = writeBooksLocal(items);
    if (!success) {
      return NextResponse.json({ error: "Failed to write database file" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE Book API error:", err);
    return NextResponse.json({ error: "Failed to delete book" }, { status: 500 });
  }
}
