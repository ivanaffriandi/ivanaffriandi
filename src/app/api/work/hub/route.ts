import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const SHUEN_API_URL = process.env.NEXT_PUBLIC_SHUEN_API_URL || "https://shuenstudio.com";
const MASTER_KEY = process.env.SHUEN_MASTER_API_KEY || "shuen_master_sec_2026_ivan_work_hub";

async function isAuthorized(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  return session?.value === "authenticated_ivan_exclusive";
}

export async function GET() {
  const auth = await isAuthorized();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized access to Master Operating Hub" }, { status: 401 });
  }

  try {
    const res = await fetch(`${SHUEN_API_URL}/api/admin/hub`, {
      headers: {
        "x-shuen-api-key": MASTER_KEY,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to communicate with SHŪ / EN Engine" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await isAuthorized();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized access to Master Operating Hub" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const res = await fetch(`${SHUEN_API_URL}/api/admin/hub`, {
      method: "PATCH",
      headers: {
        "x-shuen-api-key": MASTER_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update order status" }, { status: 500 });
  }
}
