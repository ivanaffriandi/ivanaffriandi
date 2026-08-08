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
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

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
      const err = await res.text();
      console.error("[Instagram API] Error:", err);
      return NextResponse.json({ error: "Instagram API error", detail: err }, { status: 502 });
    }

    const data = await res.json();

    // Only return IMAGE and CAROUSEL_ALBUM types (skip videos without thumbnails)
    const media = (data.data ?? []).filter(
      (m: any) =>
        m.media_type === "IMAGE" ||
        m.media_type === "CAROUSEL_ALBUM" ||
        (m.media_type === "VIDEO" && m.thumbnail_url)
    );

    return NextResponse.json({ media });
  } catch (err: any) {
    console.error("[Instagram API] Fetch failed:", err);
    return NextResponse.json({ error: "Fetch failed", detail: err.message }, { status: 500 });
  }
}
