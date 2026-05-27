import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function isIPBlocked(ip: string): Promise<boolean> {
  const defaultBlocked = ["114.10.25.175", "103.174.18.46", "180.254.78.88"];
  if (defaultBlocked.includes(ip)) return true;
  try {
    const res = await fetch("https://ivan-affriandi-default-rtdb.asia-southeast1.firebasedatabase.app/blocked_ips.json", { cache: "no-store", signal: AbortSignal.timeout(3000) });
    if (!res.ok) return defaultBlocked.includes(ip);
    const data = await res.json();
    if (!data) return defaultBlocked.includes(ip);
    const list = Object.values(data) as any[];
    return list.some(item => item.ip === ip) || defaultBlocked.includes(ip);
  } catch (err) {
    console.error("isIPBlocked check failed, using fallback list:", err);
    return defaultBlocked.includes(ip);
  }
}

export async function POST(request: Request) {
  try {
    const { action, email } = await request.json();

    if (action === "login-google") {
      if (email === "ivanaffriandi@kakao.com") {
        const cookieStore = await cookies();
        cookieStore.set("admin_session", "authenticated_ivan_exclusive", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
        });
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ success: false, error: "Access Denied: Unauthorized Google Account" }, { status: 401 });
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
    return NextResponse.json({ error: "System error" }, { status: 500 });
  }
}
