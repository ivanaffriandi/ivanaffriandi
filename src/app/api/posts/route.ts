import { NextResponse } from "next/server";
import { getPosts } from "@/lib/blogger";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const posts = await getPosts();
    return NextResponse.json({ success: true, posts });
  } catch (error) {
    console.error("GET /api/posts error:", error);
    return NextResponse.json({ success: false, posts: [] }, { status: 500 });
  }
}
