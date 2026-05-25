import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sendNotificationEmail } from "@/lib/notifications";

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
    const { postId, postTitle, postPublished, authorName, content } = body;

    if (!postId || !authorName || !content) {
      return NextResponse.json({ error: "postId, authorName and content are required" }, { status: 400 });
    }

    // Capture IP Address
    let ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";
    if (ip.includes(",")) {
      ip = ip.split(",")[0].trim();
    }

    // --- IP BLOCKLIST ---
    const blockedIPs = ["103.174.18.46", "180.254.78.88"];
    if (blockedIPs.includes(ip)) {
      return NextResponse.json(
        { error: "Your connection has been permanently restricted due to abusive behavior." },
        { status: 403 }
      );
    }
    // --------------------

    const newComment = {
      postId,
      postTitle: postTitle || "",
      postPublished: postPublished || "",
      published: new Date().toISOString(),
      content,
      approved: false,
      author: {
        displayName: authorName,
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

    // Trigger premium email notification asynchronously
    const emailSubject = `💬 New Comment on: "${postTitle || 'Untitled Post'}"`;
    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid rgba(0,0,0,0.08); border-radius: 12px; background-color: #fafaf9;">
        <h2 style="color: #1c1917; font-size: 20px; font-weight: 700; margin-bottom: 8px;">Hello Ivan,</h2>
        <p style="color: #44403c; font-size: 15px; line-height: 1.5; margin-bottom: 20px;">
          <strong>${authorName}</strong> left a comment on your blog post <strong>"${postTitle || 'Untitled'}"</strong>:
        </p>
        <div style="padding: 16px 20px; background-color: #ffffff; border-left: 4px solid #10b981; border-radius: 6px; margin-bottom: 24px; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
          <p style="color: #1c1917; font-size: 15px; line-height: 1.6; margin: 0;">"${content}"</p>
        </div>
        <p style="color: #78716c; font-size: 13px; margin-bottom: 24px;">Sent at: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })} WIB</p>
        <a href="https://ivanaffriandi.com/hq-panel" style="display: inline-block; padding: 12px 24px; background-color: #1c1917; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; transition: background-color 0.2s;">Go to Admin Portal to Approve</a>
      </div>
    `;

    // Fire-and-forget
    sendNotificationEmail(emailSubject, emailHtml).catch(err => {
      console.error("[Async Comment Notification Error]:", err);
    });

    return NextResponse.json({ id: result.name, ...newComment });
  } catch (err) {
    console.error("POST Comment API error:", err);
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
}

async function verifyAdminAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  return session?.value === "authenticated_ivan_exclusive";
}

// PATCH: Update comment (approve or add reply)
export async function PATCH(request: Request) {
  try {
    if (!(await verifyAdminAuth())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
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
    if (!(await verifyAdminAuth())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
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
