import { NextResponse } from "next/server";
import { getPosts } from "@/lib/blogger";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const posts = await getPosts();
    return NextResponse.json(
      { success: true, posts },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          "CDN-Cache-Control": "no-store",
          "Vercel-CDN-Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/posts error:", error);
    return NextResponse.json(
      { success: false, posts: [] },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }
}
