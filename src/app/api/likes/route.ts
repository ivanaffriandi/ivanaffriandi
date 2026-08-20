import { NextResponse } from "next/server";

// Firebase Realtime DB URL for likes
const FIREBASE_DB_URL = "https://ivan-affriandi-default-rtdb.asia-southeast1.firebasedatabase.app/likes";

function sanitizeKey(str: string): string {
  return str.replace(/[.#$[\]/:]/g, "_");
}

function getClientIdentifier(request: Request): string {
  let ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";
  if (ip.includes(",")) {
    ip = ip.split(",")[0].trim();
  }
  return sanitizeKey(ip);
}

// GET /api/likes?postId=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");
    if (!postId) {
      return NextResponse.json({ count: 0, hasLiked: false });
    }

    const cleanPostId = sanitizeKey(postId);
    const clientKey = getClientIdentifier(request);

    const res = await fetch(`${FIREBASE_DB_URL}/${cleanPostId}.json`, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json({ count: 0, hasLiked: false });
    }

    const data = await res.json();
    if (!data || typeof data !== "object") {
      return NextResponse.json({ count: 0, hasLiked: false });
    }

    const count = Object.keys(data).length;
    const hasLiked = !!data[clientKey];

    return NextResponse.json({ count, hasLiked });
  } catch (err) {
    console.error("GET /api/likes error:", err);
    return NextResponse.json({ count: 0, hasLiked: false });
  }
}

// POST /api/likes
// Body: { postId: string }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { postId } = body;
    if (!postId) {
      return NextResponse.json({ error: "postId is required" }, { status: 400 });
    }

    const cleanPostId = sanitizeKey(postId);
    const clientKey = getClientIdentifier(request);

    // Fetch existing likes for this post
    const fetchRes = await fetch(`${FIREBASE_DB_URL}/${cleanPostId}.json`, { cache: "no-store" });
    const existing = fetchRes.ok ? (await fetchRes.json()) || {} : {};

    let hasLiked = false;
    if (existing[clientKey]) {
      // User has already liked -> UNLIKE (delete client key)
      await fetch(`${FIREBASE_DB_URL}/${cleanPostId}/${clientKey}.json`, {
        method: "DELETE",
      });
      delete existing[clientKey];
      hasLiked = false;
    } else {
      // User has not liked -> LIKE (set timestamp)
      const now = new Date().toISOString();
      await fetch(`${FIREBASE_DB_URL}/${cleanPostId}/${clientKey}.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ likedAt: now, userAgent: request.headers.get("user-agent") || "" }),
      });
      existing[clientKey] = { likedAt: now };
      hasLiked = true;
    }

    const count = Object.keys(existing).length;
    return NextResponse.json({ count, hasLiked });
  } catch (err) {
    console.error("POST /api/likes error:", err);
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 });
  }
}
