import { NextResponse } from "next/server";

const FIREBASE_DB_URL = "https://ivan-affriandi-default-rtdb.asia-southeast1.firebasedatabase.app/visitor_sessions";

// Helper to parse User Agent
function parseUserAgentDetails(ua: string) {
  if (!ua) {
    return {
      label: "Unknown Device",
      deviceType: "Unknown",
      os: "Unknown OS",
      browser: "Unknown Browser",
      brand: "Unknown",
      model: "Unknown",
      isMobile: false,
      isBot: false,
    };
  }
  
  let os = "Unknown OS";
  let browser = "Unknown Browser";
  let device = "Desktop";
  let brand = "Unknown";
  let model = "Unknown";
  const isBot = /bot|crawler|spider|slurp|headless|preview|facebookexternalhit|whatsapp|telegram/i.test(ua);

  if (/android/i.test(ua)) {
    os = "Android";
    device = "Android Phone";
    brand = /samsung/i.test(ua) ? "Samsung" : /pixel/i.test(ua) ? "Google" : /huawei/i.test(ua) ? "Huawei" : /xiaomi|redmi|miui/i.test(ua) ? "Xiaomi" : "Android";
    const androidMatch = ua.match(/Android [^;]+;\s*([^;)]+)[;)]/i);
    model = androidMatch?.[1]?.trim() || "Android Phone";
  } else if (/ipad/i.test(ua)) {
    os = "iOS";
    device = "iPad";
    brand = "Apple";
    model = "iPad";
  } else if (/iphone/i.test(ua)) {
    os = "iOS";
    device = "iPhone";
    brand = "Apple";
    model = "iPhone";
  } else if (/macintosh|mac os x/i.test(ua)) {
    os = "macOS";
    brand = "Apple";
    model = "Mac";
  } else if (/windows/i.test(ua)) {
    os = "Windows";
    brand = "PC";
  } else if (/linux/i.test(ua)) {
    os = "Linux";
  }

  if (/edg/i.test(ua)) {
    browser = "Edge";
  } else if (/chrome|crios/i.test(ua)) {
    browser = "Chrome";
  } else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) {
    browser = "Safari";
  } else if (/firefox|fxios/i.test(ua)) {
    browser = "Firefox";
  } else if (/opera|opr/i.test(ua)) {
    browser = "Opera";
  }

  return {
    label: `${device} (${os} • ${browser})`,
    deviceType: device,
    os,
    browser,
    brand,
    model,
    isMobile: /android|iphone|ipad|mobile/i.test(ua),
    isBot,
  };
}

function parseUserAgent(ua: string): string {
  return parseUserAgentDetails(ua).label;
}

// Smart platform detection
function getPlatform(referrer: string, utmSource: string): string {
  if (utmSource) {
    return `UTM: ${utmSource}`;
  }
  if (!referrer) {
    return "Direct / Bookmark";
  }
  try {
    const url = new URL(referrer);
    const host = url.hostname.toLowerCase();
    if (host.includes("t.co") || host.includes("twitter.com") || host.includes("x.com")) {
      return "Twitter / X";
    }
    if (host.includes("instagram.com")) {
      return "Instagram";
    }
    if (host.includes("linkedin.com")) {
      return "LinkedIn";
    }
    if (host.includes("github.com")) {
      return "GitHub";
    }
    if (host.includes("facebook.com") || host.includes("fb.com")) {
      return "Facebook";
    }
    if (host.includes("tiktok.com")) {
      return "TikTok";
    }
    if (host.includes("youtube.com") || host.includes("youtu.be")) {
      return "YouTube";
    }
    if (host.includes("google.com")) {
      return "Google Search";
    }
    if (host.includes("ivanaffriandi.com") || host.includes("localhost") || host.includes("127.0.0.1")) {
      return "Internal Navigation";
    }
    return host;
  } catch (e) {
    return referrer;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { page, referrer, utmSource } = body;

    // Capture IP Address
    let ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";
    if (ip.includes(",")) {
      ip = ip.split(",")[0].trim();
    }

    const encodedIp = ip.replace(/\./g, "_").replace(/:/g, "_");

    // Fetch existing visitor session data
    let existingData: any = null;
    try {
      const getRes = await fetch(`${FIREBASE_DB_URL}/${encodedIp}.json`, { cache: "no-store" });
      if (getRes.ok) {
        existingData = await getRes.json();
      }
    } catch (e) {
      console.error("Error reading existing visitor session:", e);
    }

    // Capture User Agent & Parse Device
    const ua = request.headers.get("user-agent") || "";
    const device = parseUserAgent(ua);

    // Capture Geolocation
    const country = request.headers.get("x-vercel-ip-country") || "";
    const region = request.headers.get("x-vercel-ip-country-region") || "";
    const city = request.headers.get("x-vercel-ip-city") || "";

    let location = "Unknown Location";
    let geoDetails: any = {
      country,
      region,
      city,
      district: "",
      timezone: "",
      latitude: null,
      longitude: null,
      postalCode: "",
      isp: "",
      org: "",
      asn: "",
      provider: "",
    };
    if (city || country) {
      const parts = [city, region, country].filter(Boolean);
      location = parts.join(", ");
    } else if (existingData?.location && existingData.location !== "Unknown Location") {
      location = existingData.location;
    } else {
      // Fallback: ip-api.com lookup
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}`, { signal: AbortSignal.timeout(1500) });
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.status === "success") {
            const parts = [geoData.city, geoData.regionName, geoData.country].filter(Boolean);
            location = parts.join(", ");
            geoDetails = {
              country: geoData.country || "",
              region: geoData.regionName || "",
              city: geoData.city || "",
              district: geoData.district || "",
              timezone: geoData.timezone || "",
              latitude: geoData.lat ?? null,
              longitude: geoData.lon ?? null,
              postalCode: geoData.zip || "",
              isp: geoData.isp || "",
              org: geoData.org || "",
              asn: geoData.as || "",
              provider: geoData.isp || geoData.org || geoData.as || "",
            };
          }
        }
      } catch (err) {
        console.error("Failed to fetch location fallback:", err);
      }
    }

    const platform = getPlatform(referrer, utmSource);
    const userAgentDetails = parseUserAgentDetails(ua);

    // Update statistics
    const count = (existingData?.count || 0) + 1;
    const firstPlatform = existingData?.firstPlatform || (platform !== "Internal Navigation" ? platform : "Direct / Bookmark");
    const firstReferrer = existingData?.firstReferrer || (platform !== "Internal Navigation" ? referrer : "");
    const firstPage = existingData?.firstPage || page;

    // Log the current visit history (keep last 15 visits to prevent DB bloat)
    const historyItem = {
      page: page || "/",
      referrer: referrer || "",
      platform: platform,
      timestamp: new Date().toISOString()
    };
    const history = [historyItem, ...(existingData?.history || [])].slice(0, 15);

    const updatedSession = {
      ip,
      count,
      location,
      geo: {
        ...(existingData?.geo || {}),
        ...geoDetails,
      },
      device,
      deviceDetails: userAgentDetails,
      userAgent: ua,
      firstPlatform,
      firstReferrer,
      firstPage,
      lastPlatform: platform !== "Internal Navigation" ? platform : (existingData?.lastPlatform || firstPlatform),
      lastReferrer: referrer || (existingData?.lastReferrer || ""),
      lastPage: page || "/",
      lastSeen: new Date().toISOString(),
      history
    };

    // Save back to Firebase Realtime DB
    await fetch(`${FIREBASE_DB_URL}/${encodedIp}.json`, {
      method: "PUT",
      body: JSON.stringify(updatedSession),
      headers: {
        "Content-Type": "application/json"
      }
    });

    return NextResponse.json({ success: true, count });
  } catch (err) {
    console.error("POST Track API error:", err);
    return NextResponse.json({ error: "Failed to track session" }, { status: 500 });
  }
}
