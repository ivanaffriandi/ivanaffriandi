import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const FIREBASE_DB_URL = "https://ivan-affriandi-default-rtdb.asia-southeast1.firebasedatabase.app/blocked_ips";

async function verifyAdminAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  return session?.value === "authenticated_ivan_exclusive";
}

// GET: Fetch all blocked IPs (Admin only)
export async function GET() {
  try {
    if (!(await verifyAdminAuth())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const defaultBlocked = [
      { id: "def-1", ip: "114.10.25.175", note: "System Fallback Block", blockedAt: null, isSystem: true },
      { id: "def-2", ip: "103.174.18.46", note: "System Fallback Block", blockedAt: null, isSystem: true },
      { id: "def-3", ip: "180.254.78.88", note: "System Fallback Block", blockedAt: null, isSystem: true }
    ];

    const res = await fetch(`${FIREBASE_DB_URL}.json`, { cache: "no-store" });
    let dbItems = [];
    if (res.ok) {
      const data = await res.json();
      if (data) {
        dbItems = Object.entries(data).map(([id, val]: [string, any]) => ({
          id,
          ...val
        }));
      }
    }

    const items = [...defaultBlocked, ...dbItems];

    // Sort by blockedAt desc, keeping system ones first or sorting
    items.sort((a: any, b: any) => {
      if (a.isSystem && !b.isSystem) return -1;
      if (!a.isSystem && b.isSystem) return 1;
      return new Date(b.blockedAt || 0).getTime() - new Date(a.blockedAt || 0).getTime();
    });

    return NextResponse.json(items);
  } catch (err) {
    console.error("GET Blocked IPs error:", err);
    return NextResponse.json([]);
  }
}

// POST: Block a new IP (Admin only)
export async function POST(request: Request) {
  try {
    if (!(await verifyAdminAuth())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ip, note } = await request.json();
    if (!ip) {
      return NextResponse.json({ error: "IP address is required" }, { status: 400 });
    }

    const cleanIP = ip.trim();

    // Check if already blocked in DB
    const currentRes = await fetch(`${FIREBASE_DB_URL}.json`, { cache: "no-store" });
    if (currentRes.ok) {
      const data = await currentRes.json();
      if (data) {
        const alreadyExists = Object.values(data).some((item: any) => item.ip === cleanIP);
        if (alreadyExists) {
          return NextResponse.json({ error: "IP is already blocked in database" }, { status: 400 });
        }
      }
    }

    const newBlockedIP = {
      ip: cleanIP,
      note: note || "Blocked by Admin",
      blockedAt: new Date().toISOString()
    };

    const res = await fetch(`${FIREBASE_DB_URL}.json`, {
      method: "POST",
      body: JSON.stringify(newBlockedIP),
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) throw new Error("Failed to write to Firebase");

    const result = await res.json();
    return NextResponse.json({ id: result.name, ...newBlockedIP });
  } catch (err: any) {
    console.error("POST Blocked IP error:", err);
    return NextResponse.json({ error: err.message || "Failed to block IP" }, { status: 500 });
  }
}

// DELETE: Unblock an IP (Admin only)
export async function DELETE(request: Request) {
  try {
    if (!(await verifyAdminAuth())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const res = await fetch(`${FIREBASE_DB_URL}/${id}.json`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete from Firebase");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE Blocked IP error:", err);
    return NextResponse.json({ error: "Failed to unblock IP" }, { status: 500 });
  }
}
