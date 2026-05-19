import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { action, password } = await request.json();

    if (action === "login") {
      if (password === "1Ndrowatu!") {
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
      return NextResponse.json({ success: false, error: "Access Denied" }, { status: 401 });
    }

    if (action === "logout") {
      const cookieStore = await cookies();
      cookieStore.delete("admin_session");
      return NextResponse.json({ success: true });
    }

    if (action === "check") {
      const cookieStore = await cookies();
      const session = cookieStore.get("admin_session");
      return NextResponse.json({ authenticated: session?.value === "authenticated_ivan_exclusive" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: "System error" }, { status: 500 });
  }
}
