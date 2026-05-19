import { NextResponse } from "next/server";

// URL Database Realtime Firebase Resmi & Aktif milik Ivan Affriandi (Region Singapura)
const FIREBASE_DB_URL = "https://ivan-affriandi-default-rtdb.asia-southeast1.firebasedatabase.app/questions";

// Helper untuk membaca semua pertanyaan dari Firebase Realtime DB
async function readQuestionsList(): Promise<any[]> {
  try {
    const res = await fetch(`${FIREBASE_DB_URL}.json`, { cache: "no-store" });
    if (!res.ok) {
      return [];
    }
    const data = await res.json();
    if (!data) return [];

    // Konversi object Firebase ke format array standar
    return Object.entries(data).map(([id, val]: [string, any]) => ({
      id,
      ...val
    }));
  } catch (err) {
    console.error("Read Firebase Realtime DB error:", err);
    return [];
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const answeredOnly = searchParams.get("answered") === "true";

    let items = await readQuestionsList();

    // Urutkan berdasarkan tanggal rilis (terbaru di atas)
    items.sort((a: any, b: any) => new Date(b.published).getTime() - new Date(a.published).getTime());

    if (answeredOnly) {
      items = items.filter((item: any) => item.answered === true);
    }

    return NextResponse.json(items);
  } catch (err) {
    console.error("GET Questions API error:", err);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const { content } = await request.json();
    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const newQuestion = {
      content,
      published: new Date().toISOString(),
      answered: false
    };

    // Tulis data baru secara efisien ke Firebase Realtime DB menggunakan POST
    const res = await fetch(`${FIREBASE_DB_URL}.json`, {
      method: "POST",
      body: JSON.stringify(newQuestion),
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) {
      throw new Error("Failed to write to Firebase");
    }

    const result = await res.json();

    // name adalah ID unik yang dibuat otomatis oleh Firebase Realtime DB
    return NextResponse.json({
      id: result.name,
      ...newQuestion
    });
  } catch (err) {
    console.error("POST Question API error:", err);
    return NextResponse.json({ error: "Failed to add question" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, answerText } = await request.json();
    if (!id || !answerText) {
      return NextResponse.json({ error: "ID and answerText are required" }, { status: 400 });
    }

    // Update field answered dan answer menggunakan PATCH untuk efisiensi maksimal
    const res = await fetch(`${FIREBASE_DB_URL}/${id}.json`, {
      method: "PATCH",
      body: JSON.stringify({
        answered: true,
        answer: answerText
      }),
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) {
      throw new Error("Failed to update question in Firebase");
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT Question API error:", err);
    return NextResponse.json({ error: "Failed to answer question" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Hapus data secara permanen berdasarkan ID
    const res = await fetch(`${FIREBASE_DB_URL}/${id}.json`, {
      method: "DELETE"
    });

    if (!res.ok) {
      throw new Error("Failed to delete question from Firebase");
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE Question API error:", err);
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 });
  }
}
