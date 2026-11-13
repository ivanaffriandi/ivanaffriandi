import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * GET /api/instagram
 * Returns all moments/Instagram photos sorted by newest upload first.
 * Strictly photos only (IMAGE / CAROUSEL_ALBUM).
 */
export async function GET() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  // 1. If an active Instagram Graph API token is configured, fetch live media
  if (token) {
    try {
      const fields = "id,caption,media_url,thumbnail_url,permalink,media_type,timestamp";
      const limit = 50;
      const res = await fetch(
        `https://graph.instagram.com/me/media?fields=${fields}&limit=${limit}&access_token=${token}`,
        {
          next: {
            revalidate: 3600, // Cache for 1 hour
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        // Strictly photos only (IMAGE and CAROUSEL_ALBUM, no VIDEO / REELS)
        const media = (data.data ?? []).filter(
          (m: any) => m.media_type === "IMAGE" || m.media_type === "CAROUSEL_ALBUM"
        );
        if (media.length > 0) {
          return NextResponse.json({ media });
        }
      } else {
        console.warn("[Instagram API] Graph API returned non-OK status:", res.status);
      }
    } catch (err) {
      console.warn("[Instagram API] Live fetch failed, falling back to local moments:", err);
    }
  }

  // 2. Fallback to local moments in public/images/moments (strictly photos only)
  try {
    const dir = path.join(process.cwd(), "public/images/moments");
    if (fs.existsSync(dir)) {
      const files = fs
        .readdirSync(dir)
        .filter(
          (f) =>
            !f.startsWith(".") &&
            (f.endsWith(".jpg") || f.endsWith(".jpeg") || f.endsWith(".webp") || f.endsWith(".png"))
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
