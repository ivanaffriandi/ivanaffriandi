import { NextResponse } from "next/server";
import { sendNotificationEmail } from "@/lib/notifications";

// URL Database Realtime Firebase Resmi & Aktif milik Ivan Affriandi (Region Singapura)
const FIREBASE_DB_URL = "https://ivan-affriandi-default-rtdb.asia-southeast1.firebasedatabase.app/questions";


// Helper untuk membaca semua pertanyaan dari Firebase Realtime DB
async function readQuestionsList(): Promise<any[]> {
  try {
    const res = await fetch(`${FIREBASE_DB_URL}.json`, { cache: "no-store" });
    if (!res.ok) {
      return [];
    }
    const data = await res.json();
    if (!data) return [];

    // Konversi object Firebase ke format array standar
    return Object.entries(data).map(([id, val]: [string, any]) => ({
      id,
      ...val
    }));
  } catch (err) {
    console.error("Read Firebase Realtime DB error:", err);
    return [];
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const answeredOnly = searchParams.get("answered") === "true";

    let items = await readQuestionsList();

    // Urutkan berdasarkan tanggal jawab/tanya (terbaru di atas)
    items.sort((a: any, b: any) => {
      const timeA = new Date(a.answeredAt || a.published).getTime();
      const timeB = new Date(b.answeredAt || b.published).getTime();
      return timeB - timeA;
    });

    if (answeredOnly) {
      items = items.filter((item: any) => item.answered === true);
    }

    return NextResponse.json(items);
  } catch (err) {
    console.error("GET Questions API error:", err);
    return NextResponse.json([]);
  }
}

// Helper to parse User Agent into Device / OS / Browser
function parseUserAgent(ua: string): string {
  if (!ua) return "Unknown Device";
  
  let os = "Unknown OS";
  let browser = "Unknown Browser";
  let device = "Desktop";

  // OS detection
  if (/android/i.test(ua)) {
    os = "Android";
    device = "Android Phone";
  } else if (/ipad/i.test(ua)) {
    os = "iOS";
    device = "iPad";
  } else if (/iphone/i.test(ua)) {
    os = "iOS";
    device = "iPhone";
  } else if (/macintosh|mac os x/i.test(ua)) {
    os = "macOS";
  } else if (/windows/i.test(ua)) {
    os = "Windows";
  } else if (/linux/i.test(ua)) {
    os = "Linux";
  }

  // Browser detection
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

  return `${device} (${os} • ${browser})`;
}

// Stable Pseudo-ID generator based on hashing IP + User Agent
function generatePseudoId(ip: string, userAgent: string): string {
  const combined = `${ip}-${userAgent}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).substring(0, 4).toUpperCase();
  return `Anon-${hex}`;
}

export async function POST(request: Request) {
  try {
    const { content, name } = await request.json();
    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // Capture IP Address
    let ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";
    if (ip.includes(",")) {
      ip = ip.split(",")[0].trim();
    }

    // Capture User Agent & Parse Device
    const ua = request.headers.get("user-agent") || "";
    const device = parseUserAgent(ua);

    // Capture Geolocation
    const country = request.headers.get("x-vercel-ip-country") || "";
    const region = request.headers.get("x-vercel-ip-country-region") || "";
    const city = request.headers.get("x-vercel-ip-city") || "";

    let location = "Unknown Location";
    if (city || country) {
      const parts = [city, region, country].filter(Boolean);
      location = parts.join(", ");
    } else {
      // Fallback: ip-api.com lookup
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}`, { signal: AbortSignal.timeout(2000) });
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.status === "success") {
            const parts = [geoData.city, geoData.regionName, geoData.country].filter(Boolean);
            location = parts.join(", ");
          }
        }
      } catch (err) {
        console.error("Failed to fetch location fallback:", err);
      }
    }

    // Compute display name / identifier
    const cleanName = name?.trim() || "";
    const pseudoId = generatePseudoId(ip, ua);
    const displayName = cleanName ? `${cleanName} (${pseudoId})` : `Anonymous (${pseudoId})`;

    const newQuestion = {
      content,
      published: new Date().toISOString(),
      answered: false,
      ip,
      location,
      device,
      name: displayName
    };

    // Tulis data baru secara efisien ke Firebase Realtime DB menggunakan POST
    const res = await fetch(`${FIREBASE_DB_URL}.json`, {
      method: "POST",
      body: JSON.stringify(newQuestion),
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) {
      throw new Error("Failed to write to Firebase");
    }

    const result = await res.json();

    // Trigger premium email notification asynchronously (so the visitor isn't delayed)
    const emailSubject = `📬 New Message from ${displayName}!`;
    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid rgba(0,0,0,0.08); border-radius: 12px; background-color: #fafaf9;">
        <h2 style="color: #1c1917; font-size: 20px; font-weight: 700; margin-bottom: 8px;">Hello Ivan,</h2>
        <p style="color: #44403c; font-size: 15px; line-height: 1.5; margin-bottom: 20px;">You've received a new message on your portal:</p>
        <div style="padding: 16px 20px; background-color: #ffffff; border-left: 4px solid #007aff; border-radius: 6px; margin-bottom: 20px; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
          <p style="color: #1c1917; font-size: 16px; font-style: italic; line-height: 1.6; margin: 0;">"${content}"</p>
        </div>
        
        <!-- Premium Sender Metadata Box -->
        <div style="margin-bottom: 24px; padding: 14px 16px; background-color: #ffffff; border: 1px solid rgba(0,0,0,0.06); border-radius: 8px; font-size: 13px; color: #44403c; box-shadow: 0 1px 2px rgba(0,0,0,0.01);">
          <p style="margin: 0 0 6px 0; font-size: 13px; line-height: 1.4;"><strong>Sender:</strong> 👤 ${displayName}</p>
          <p style="margin: 0 0 6px 0; font-size: 13px; line-height: 1.4;"><strong>Location:</strong> 📍 ${location}</p>
          <p style="margin: 0 0 6px 0; font-size: 13px; line-height: 1.4;"><strong>Device:</strong> 📱 ${device}</p>
          <p style="margin: 0; font-size: 13px; line-height: 1.4;"><strong>IP Address:</strong> 🌐 ${ip}</p>
        </div>

        <p style="color: #78716c; font-size: 13px; margin-bottom: 24px;">Sent at: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })} WIB</p>
        <a href="https://ivanaffriandi.com/admin" style="display: inline-block; padding: 12px 24px; background-color: #1c1917; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; transition: background-color 0.2s;">Go to Admin Portal</a>
      </div>
    `;

    // Fire-and-forget email sending
    sendNotificationEmail(emailSubject, emailHtml).catch(err => {
      console.error("[Async Email Notification Error]:", err);
    });

    // name adalah ID unik yang dibuat otomatis oleh Firebase Realtime DB
    return NextResponse.json({
      id: result.name,
      ...newQuestion
    });
  } catch (err) {
    console.error("POST Question API error:", err);
    return NextResponse.json({ error: "Failed to add question" }, { status: 500 });
  }
}


export async function PUT(request: Request) {
  try {
    const { id, answerText } = await request.json();
    if (!id || !answerText) {
      return NextResponse.json({ error: "ID and answerText are required" }, { status: 400 });
    }

    // Update field answered, answer, dan answeredAt menggunakan PATCH untuk efisiensi maksimal
    const res = await fetch(`${FIREBASE_DB_URL}/${id}.json`, {
      method: "PATCH",
      body: JSON.stringify({
        answered: true,
        answer: answerText,
        answeredAt: new Date().toISOString()
      }),
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) {
      throw new Error("Failed to update question in Firebase");
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT Question API error:", err);
    return NextResponse.json({ error: "Failed to answer question" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Hapus data secara permanen berdasarkan ID
    const res = await fetch(`${FIREBASE_DB_URL}/${id}.json`, {
      method: "DELETE"
    });

    if (!res.ok) {
      throw new Error("Failed to delete question from Firebase");
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE Question API error:", err);
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 });
  }
}
