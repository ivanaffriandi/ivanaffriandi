import { NextResponse } from "next/server";
import { getLatestTweets } from "@/lib/twitter";

export async function GET() {
  try {
    const tweets = await getLatestTweets();
    return NextResponse.json(tweets);
  } catch (error) {
    console.error("❌ [API Route /api/twitter] Error:", error);
    return NextResponse.json({ error: "Failed to fetch tweets list" }, { status: 500 });
  }
}
