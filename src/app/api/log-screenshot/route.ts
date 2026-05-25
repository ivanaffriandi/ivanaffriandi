import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const FIREBASE_LOGS_URL = "https://ivan-affriandi-default-rtdb.asia-southeast1.firebasedatabase.app/security_logs.json";

export async function POST(request: Request) {
  try {
    const { type } = await request.json();
    
    // Extract IP from headers
    const forwardedFor = request.headers.get("x-forwarded-for");
    let ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "Unknown IP";
    if (ip === "::1" || ip === "127.0.0.1") {
      ip = "Localhost";
    }

    // Extract User Agent
    const ua = request.headers.get("user-agent") || "Unknown Browser";

    // Attempt to resolve Location via free IP API (Best effort)
    let location = "Unknown Location";
    if (ip !== "Localhost" && ip !== "Unknown IP") {
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city`, { cache: 'no-store' });
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.status === "success") {
            const parts = [geoData.city, geoData.regionName, geoData.country].filter(Boolean);
            location = parts.join(", ");
          }
        }
      } catch (e) {
        // Ignore geo resolution errors
      }
    }

    const logEntry = {
      action: "MALICIOUS_SCREENSHOT_ATTEMPT",
      details: type,
      ip,
      location,
      userAgent: ua,
      timestamp: new Date().toISOString()
    };

    // Log to Firebase Realtime DB
    await fetch(FIREBASE_LOGS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(logEntry)
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Screenshot Logger Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
