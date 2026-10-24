import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * GET /api/instagram
 * Returns all moments/Instagram photos sorted by newest upload first.
 */
export async function GET() {
  try {
    const dir = path.join(process.cwd(), "public/images/moments");
    if (fs.existsSync(dir)) {
      const files = fs
        .readdirSync(dir)
        .filter(
          (f) =>
            !f.startsWith(".") &&
            (f.endsWith(".jpg") || f.endsWith(".webp") || f.endsWith(".png"))
        );

      const media = files
        .map((f) => {
          const match = f.match(/^(\d+)/);
          const num = match ? parseInt(match[1], 10) : 0;
          return {
            id: f,
            media_url: `/images/moments/${f}`,
            thumbnail_url: `/images/moments/${f}`,
            permalink: "https://instagram.com/ivanaffriandi",
            order: num,
          };
        })
        .sort((a, b) => b.order - a.order);

      if (media.length > 0) {
        return NextResponse.json({ media });
      }
    }
  } catch (err) {
    console.warn("[Instagram API] Failed to read local moments:", err);
  }

  return NextResponse.json({ media: [] });
}
