// Comments library — uses /api/comments server route (Firebase Realtime DB)
// This avoids Firestore client-side security rule issues entirely.

export interface CommentItem {
  id: string;
  postId: string;
  published: string;
  content: string;
  approved: boolean;
  reply?: string;
  author: {
    displayName: string;
    email: string;
    image: { url: string };
  };
}

// 1. Add a new comment (via server-side API route)
export async function addComment(
  postId: string,
  authorName: string,
  authorEmail: string,
  content: string
): Promise<CommentItem> {
  const res = await fetch("/api/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ postId, authorName, authorEmail, content })
  });

  if (!res.ok) {
    throw new Error(`Failed to add comment: ${res.statusText}`);
  }

  return res.json();
}

// 2. Get approved comments for a specific post (for blog display)
export async function getApprovedComments(postId: string): Promise<CommentItem[]> {
  try {
    const res = await fetch(`/api/comments?postId=${encodeURIComponent(postId)}&approved=true`, {
      cache: "no-store"
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// 3. Get ALL comments for admin moderation
export async function getAllCommentsForAdmin(): Promise<CommentItem[]> {
  try {
    const res = await fetch("/api/comments", { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// 4. Approve a comment
export async function approveComment(commentId: string): Promise<boolean> {
  try {
    const res = await fetch("/api/comments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: commentId, action: "approve" })
    });
    return res.ok;
  } catch {
    return false;
  }
}

// 5. Delete a comment
export async function deleteComment(commentId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/comments?id=${encodeURIComponent(commentId)}`, {
      method: "DELETE"
    });
    return res.ok;
  } catch {
    return false;
  }
}

// 6. Admin replies to a comment
export async function replyComment(commentId: string, replyText: string): Promise<boolean> {
  try {
    const res = await fetch("/api/comments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: commentId, action: "reply", replyText })
    });
    return res.ok;
  } catch {
    return false;
  }
}
