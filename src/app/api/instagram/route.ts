import { NextResponse } from "next/server";
import { getInstagramGallery } from "@/lib/gallery";

export async function GET() {
  try {
    const gallery = await getInstagramGallery();
    return NextResponse.json(gallery);
  } catch (error) {
    console.error("❌ [API Route /api/instagram] Error:", error);
    return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 });
  }
}
