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
    media_url: "/images/moments/489831318_18060819218098563_9042912996466521959_n..jpg",
    thumbnail_url: "/images/moments/489831318_18060819218098563_9042912996466521959_n..jpg",
    caption: "Late night at the desk. Tactile objects and leather journals. #minimalism #design",
    permalink: "https://instagram.com/ivanaffriandi",
    media_type: "IMAGE",
    timestamp: "2026-08-01T12:00:00+0000"
  },
  {
    id: "ig_fall_2",
    media_url: "/images/moments/489981712_18060820535098563_7970226616275307425_n..jpg",
    thumbnail_url: "/images/moments/489981712_18060820535098563_7970226616275307425_n..jpg",
    caption: "Quiet studio moments & photography studies. #blackandwhite",
    permalink: "https://instagram.com/ivanaffriandi",
    media_type: "IMAGE",
    timestamp: "2026-07-28T14:30:00+0000"
  },
  {
    id: "ig_fall_3",
    media_url: "/images/moments/490264363_18060820598098563_7427301390244621778_n..jpg",
    thumbnail_url: "/images/moments/490264363_18060820598098563_7427301390244621778_n..jpg",
    caption: "Architectural geometries and monochrome light. #slowliving",
    permalink: "https://instagram.com/ivanaffriandi",
    media_type: "IMAGE",
    timestamp: "2026-07-25T20:15:00+0000"
  },
  {
    id: "ig_fall_4",
    media_url: "/images/moments/490289674_18060831101098563_7940423172567879925_n..jpg",
    thumbnail_url: "/images/moments/490289674_18060831101098563_7940423172567879925_n..jpg",
    caption: "Tactile paper, notes & desk arrangement. #workspace",
    permalink: "https://instagram.com/ivanaffriandi",
    media_type: "IMAGE",
    timestamp: "2026-07-20T09:00:00+0000"
  },
  {
    id: "ig_fall_5",
    media_url: "/images/moments/490362933_18060828515098563_4365648610343813957_n..jpg",
    thumbnail_url: "/images/moments/490362933_18060828515098563_4365648610343813957_n..jpg",
    caption: "Sculptural forms and physical desk objects. #designsystem #3d",
    permalink: "https://instagram.com/ivanaffriandi",
    media_type: "IMAGE",
    timestamp: "2026-07-15T16:45:00+0000"
  },
  {
    id: "ig_fall_6",
    media_url: "/images/moments/491109336_18060820190098563_779269879364280171_n..jpg",
    thumbnail_url: "/images/moments/491109336_18060820190098563_779269879364280171_n..jpg",
    caption: "Horizon studies. Perspective & quiet waters. #reflections",
    permalink: "https://instagram.com/ivanaffriandi",
    media_type: "IMAGE",
    timestamp: "2026-07-10T11:20:00+0000"
  },
  {
    id: "ig_fall_7",
    media_url: "/images/moments/490307779_18060821810098563_6672692916374320684_n..jpg",
    thumbnail_url: "/images/moments/490307779_18060821810098563_6672692916374320684_n..jpg",
    caption: "Light through shadows. Minimalist visual log. #photography",
    permalink: "https://instagram.com/ivanaffriandi",
    media_type: "IMAGE",
    timestamp: "2026-07-05T18:00:00+0000"
  },
  {
    id: "ig_fall_8",
    media_url: "/images/moments/490494934_18060829358098563_6690275826446676296_n..jpg",
    thumbnail_url: "/images/moments/490494934_18060829358098563_6690275826446676296_n..jpg",
    caption: "Framing architecture and urban textures. #design",
    permalink: "https://instagram.com/ivanaffriandi",
    media_type: "IMAGE",
    timestamp: "2026-07-01T10:00:00+0000"
  },
  {
    id: "ig_fall_9",
    media_url: "/images/moments/504834828_18066125465098563_815024945322165390_n..jpg",
    thumbnail_url: "/images/moments/504834828_18066125465098563_815024945322165390_n..jpg",
    caption: "Monochrome perspective & architectural curvature. #blackandwhite",
    permalink: "https://instagram.com/ivanaffriandi",
    media_type: "IMAGE",
    timestamp: "2026-06-25T15:00:00+0000"
  }
];
