import { NextResponse } from "next/server";

// Firebase Realtime DB (same region as questions)
const FIREBASE_DB_URL = "https://ivan-affriandi-default-rtdb.asia-southeast1.firebasedatabase.app/comments";

async function readCommentsList(): Promise<any[]> {
  try {
    const res = await fetch(`${FIREBASE_DB_URL}.json`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data) return [];
    return Object.entries(data).map(([id, val]: [string, any]) => ({ id, ...val }));
  } catch (err) {
    console.error("Read comments Firebase error:", err);
    return [];
  }
}

// GET: Fetch all comments (admin) or approved comments per post (?postId=xxx&approved=true)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");
    const approvedOnly = searchParams.get("approved") === "true";

    let items = await readCommentsList();

    if (postId) {
      items = items.filter((c: any) => c.postId === postId);
    }
    if (approvedOnly) {
      items = items.filter((c: any) => c.approved === true);
    }

    items.sort((a: any, b: any) => new Date(b.published).getTime() - new Date(a.published).getTime());

    return NextResponse.json(items);
  } catch (err) {
    console.error("GET Comments API error:", err);
    return NextResponse.json([]);
  }
}

// POST: Add a new comment
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { postId, authorName, authorEmail, content } = body;

    if (!postId || !authorName || !content) {
      return NextResponse.json({ error: "postId, authorName and content are required" }, { status: 400 });
    }

    const newComment = {
      postId,
      published: new Date().toISOString(),
      content,
      approved: false,
      author: {
        displayName: authorName,
        email: authorEmail || "anonymous@example.com",
        image: {
          url: `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=E2DDD5&color=333`
        }
      }
    };

    const res = await fetch(`${FIREBASE_DB_URL}.json`, {
      method: "POST",
      body: JSON.stringify(newComment),
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) throw new Error("Failed to write comment to Firebase");

    const result = await res.json();
    return NextResponse.json({ id: result.name, ...newComment });
  } catch (err) {
    console.error("POST Comment API error:", err);
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
}

// PATCH: Update comment (approve or add reply)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, action, replyText } = body;

    if (!id || !action) {
      return NextResponse.json({ error: "id and action are required" }, { status: 400 });
    }

    let updatePayload: Record<string, any> = {};
    if (action === "approve") {
      updatePayload = { approved: true };
    } else if (action === "reply" && replyText) {
      updatePayload = { reply: replyText };
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const res = await fetch(`${FIREBASE_DB_URL}/${id}.json`, {
      method: "PATCH",
      body: JSON.stringify(updatePayload),
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) throw new Error("Failed to update comment in Firebase");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH Comment API error:", err);
    return NextResponse.json({ error: "Failed to update comment" }, { status: 500 });
  }
}

// DELETE: Remove a comment
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const res = await fetch(`${FIREBASE_DB_URL}/${id}.json`, { method: "DELETE" });

    if (!res.ok) throw new Error("Failed to delete comment from Firebase");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE Comment API error:", err);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}
