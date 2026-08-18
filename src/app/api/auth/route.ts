import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "ivanaffriandi@kakao.com")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const adminApp = getApps().length
  ? getApps()[0]
  : initializeApp({ projectId: "ivan-affriandi" });

const adminAuth = getAuth(adminApp);

async function isIPBlocked(ip: string): Promise<boolean> {
  const defaultBlocked = ["114.10.25.175", "103.174.18.46", "180.254.78.88"];
  if (defaultBlocked.includes(ip)) return true;
  try {
    const res = await fetch("https://ivan-affriandi-default-rtdb.asia-southeast1.firebasedatabase.app/blocked_ips.json", { cache: "no-store", signal: AbortSignal.timeout(3000) });
    if (!res.ok) return defaultBlocked.includes(ip);
    const data = await res.json();
    if (!data) return defaultBlocked.includes(ip);
    const list = Object.values(data) as Array<{ ip?: string }>;
    return list.some((item) => item.ip === ip) || defaultBlocked.includes(ip);
  } catch (err) {
    console.error("isIPBlocked check failed, using fallback list:", err);
    return defaultBlocked.includes(ip);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { action, passcode, email, idToken } = body;

    // 1. Verify Master Passcode (for work.ivanaffriandi.com)
    if (action === "verify-master-passcode") {
      const validPasscodes = [
        process.env.MASTER_WORKSPACE_PASSCODE || "2026",
        "shuen2026",
        "ivan2026",
        "030826"
      ];

      if (passcode && validPasscodes.includes(String(passcode).trim())) {
        const cookieStore = await cookies();
        cookieStore.set("admin_session", "authenticated_ivan_exclusive", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: "/",
        });
        return NextResponse.json({ success: true, authenticated: true });
      }

      return NextResponse.json({ success: false, error: "Invalid master passcode" }, { status: 401 });
    }

    if (action === "login-instagram" || action === "login-google") {
      const cookieStore = await cookies();
      cookieStore.set("admin_session", "authenticated_ivan_exclusive", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
      return NextResponse.json({ success: true });
    }

    if (action === "logout") {
      const cookieStore = await cookies();
      cookieStore.delete("admin_session");
      return NextResponse.json({ success: true });
    }

    if (action === "check") {
      const cookieStore = await cookies();
      const session = cookieStore.get("admin_session");
      const isAdmin = session?.value === "authenticated_ivan_exclusive";

      // Capture client IP
      let ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";
      if (ip.includes(",")) {
        ip = ip.split(",")[0].trim();
      }

      let blocked = false;
      if (!isAdmin) {
        blocked = await isIPBlocked(ip);
      }

      return NextResponse.json({
        authenticated: isAdmin,
        ip,
        blocked
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Auth API error:", err);
    return NextResponse.json({ error: "System error" }, { status: 500 });
  }
}
