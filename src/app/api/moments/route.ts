import { NextResponse } from "next/server";
import { getAllMoments } from "@/lib/moments";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const moments = await getAllMoments();
    return NextResponse.json(moments);
  } catch (error) {
    console.error("❌ [API Route /api/moments] Error:", error);
    return NextResponse.json({ error: "Failed to fetch moments" }, { status: 500 });
  }
}
