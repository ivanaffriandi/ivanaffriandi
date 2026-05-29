import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const FIREBASE_DB_URL = "https://ivan-affriandi-default-rtdb.asia-southeast1.firebasedatabase.app/visitor_sessions.json";

async function verifyAdminAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  return session?.value === "authenticated_ivan_exclusive";
}

export async function GET() {
  try {
    if (!(await verifyAdminAuth())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(FIREBASE_DB_URL, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json({});
    }
    const data = await res.json();
    return NextResponse.json(data || {});
  } catch (err) {
    console.error("GET Visitor Sessions error:", err);
    return NextResponse.json({});
  }
}
