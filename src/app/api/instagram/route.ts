import { NextResponse } from "next/server";

const IG_API_BASE = "https://graph.instagram.com";

/**
 * GET /api/instagram
 * Fetches the latest media from Instagram Graph API using a long-lived access token.
 * The token must be set in the INSTAGRAM_ACCESS_TOKEN environment variable.
 *
 * Instagram Graph API docs:
 * https://developers.facebook.com/docs/instagram-basic-display-api/reference/media
 */
export async function GET() {
  const token =
    process.env.INSTAGRAM_ACCESS_TOKEN ||
    "IGAAXAZAWn68ZBtBZAGFZAREw2cWozcThCa3R1aWhmSkR2Rm1GT3d6R3BIanR2U09saDllaUxNM2tMZAWFvWjJwa2U3R1hDVGVja3RZAcmNXSFBvWlFCUEtJYnBmSFVKN1ZA2TC1KYlNhVWFWWXl3bHFTejl6ZAnZAkQklGYzRZAX3JwSDcwcwZDZD";

  if (!token) {
    return NextResponse.json(
      { error: "INSTAGRAM_ACCESS_TOKEN not configured" },
      { status: 500 }
    );
  }

  try {
    const fields = "id,caption,media_url,thumbnail_url,permalink,media_type,timestamp";
    const limit = 30;

    const res = await fetch(
      `${IG_API_BASE}/me/media?fields=${fields}&limit=${limit}&access_token=${token}`,
      {
        next: {
          // Cache for 1 hour
          revalidate: 3600,
        },
      }
    );

    if (!res.ok) {
      console.warn("[Instagram API] Graph API token invalid or expired. Using curated media fallback.");
      return NextResponse.json({ media: FALLBACK_INSTAGRAM_MEDIA });
    }

    const data = await res.json();

    // Only return IMAGE and CAROUSEL_ALBUM types (skip videos without thumbnails)
    const media = (data.data ?? []).filter(
      (m: any) =>
        m.media_type === "IMAGE" ||
        m.media_type === "CAROUSEL_ALBUM" ||
        (m.media_type === "VIDEO" && m.thumbnail_url)
    );

    return NextResponse.json({ media: media.length > 0 ? media : FALLBACK_INSTAGRAM_MEDIA });
  } catch (err: any) {
    console.error("[Instagram API] Fetch failed, returning fallback media:", err);
    return NextResponse.json({ media: FALLBACK_INSTAGRAM_MEDIA });
  }
}

const FALLBACK_INSTAGRAM_MEDIA = [
  {
    id: "ig_fall_1",
    media_url: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgI41h8Kx-xJ8hX7b-7b7b7b7b7b/s1600/leather_journal_desk.png",
    thumbnail_url: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgI41h8Kx-xJ8hX7b-7b7b7b7b7b/s1600/leather_journal_desk.png",
    caption: "Late night at the desk. Tactile objects and leather journals. #minimalism #design",
    permalink: "https://instagram.com/ivanaffriandi",
    media_type: "IMAGE",
    timestamp: "2026-08-01T12:00:00+0000"
  },
  {
    id: "ig_fall_2",
    media_url: "/images/beach_cliff_mono.png",
    thumbnail_url: "/images/beach_cliff_mono.png",
    caption: "Groen in de Buurt — morning reflections in Utrecht. #photography #blackandwhite",
    permalink: "https://instagram.com/ivanaffriandi",
    media_type: "IMAGE",
    timestamp: "2026-07-28T14:30:00+0000"
  },
  {
    id: "ig_fall_3",
    media_url: "/images/campfire_fire_mono.png",
    thumbnail_url: "/images/campfire_fire_mono.png",
    caption: "Midnight warmth. Simple moments by the fire. #slowliving",
    permalink: "https://instagram.com/ivanaffriandi",
    media_type: "IMAGE",
    timestamp: "2026-07-25T20:15:00+0000"
  },
  {
    id: "ig_fall_4",
    media_url: "/images/winter_trees_mono.png",
    thumbnail_url: "/images/winter_trees_mono.png",
    caption: "De Vensterbank. Utrecht in deep winter. #architecture #monochrome",
    permalink: "https://instagram.com/ivanaffriandi",
    media_type: "IMAGE",
    timestamp: "2026-07-20T09:00:00+0000"
  },
  {
    id: "ig_fall_5",
    media_url: "/images/defining_brand_mono.png",
    thumbnail_url: "/images/defining_brand_mono.png",
    caption: "Sculptural forms and physical desk objects. #designsystem #3d",
    permalink: "https://instagram.com/ivanaffriandi",
    media_type: "IMAGE",
    timestamp: "2026-07-15T16:45:00+0000"
  },
  {
    id: "ig_fall_6",
    media_url: "/images/ocean_hero_mono.png",
    thumbnail_url: "/images/ocean_hero_mono.png",
    caption: "Horizon studies. Horizon & perspective. #journal #reflections",
    permalink: "https://instagram.com/ivanaffriandi",
    media_type: "IMAGE",
    timestamp: "2026-07-10T11:20:00+0000"
  }
];
