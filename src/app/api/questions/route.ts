import { NextResponse } from "next/server";
import { sendNotificationEmail } from "@/lib/notifications";

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

    // Trigger premium email notification asynchronously (so the visitor isn't delayed)
    const emailSubject = "📬 New Anonymous Message Received!";
    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid rgba(0,0,0,0.08); border-radius: 12px; background-color: #fafaf9;">
        <h2 style="color: #1c1917; font-size: 20px; font-weight: 700; margin-bottom: 8px;">Hello Ivan,</h2>
        <p style="color: #44403c; font-size: 15px; line-height: 1.5; margin-bottom: 20px;">You've received a new anonymous message on your portal:</p>
        <div style="padding: 16px 20px; background-color: #ffffff; border-left: 4px solid #007aff; border-radius: 6px; margin-bottom: 24px; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
          <p style="color: #1c1917; font-size: 16px; font-style: italic; line-height: 1.6; margin: 0;">"${content}"</p>
        </div>
        <p style="color: #78716c; font-size: 13px; margin-bottom: 24px;">Sent at: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })} WIB</p>
        <a href="https://ivanaffriandi.com/admin" style="display: inline-block; padding: 12px 24px; background-color: #1c1917; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; transition: background-color 0.2s;">Go to Admin Portal</a>
      </div>
    `;

    // Fire-and-forget email sending
    sendNotificationEmail(emailSubject, emailHtml).catch(err => {
      console.error("[Async Email Notification Error]:", err);
    });

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
