import { NextResponse } from "next/server";

// Simple in-memory storage for subscribers & broadcast log
const subscribers: Set<string> = new Set([
  "hello@ivanaffriandi.com",
]);

interface BroadcastPayload {
  subject: string;
  content: string;
}

export async function GET() {
  return NextResponse.json({
    success: true,
    total_subscribers: subscribers.size,
    subscribers: Array.from(subscribers),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Action: SUBSCRIBE
    if (body.action === "subscribe" || body.email) {
      const email = (body.email || "").trim().toLowerCase();
      if (!email || !email.includes("@")) {
        return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
      }

      subscribers.add(email);
      console.log(`[Newsletter API] New subscriber added: ${email}`);

      return NextResponse.json({
        success: true,
        message: "Thank you for subscribing to Ivan's quiet journal!",
        email,
        total_subscribers: subscribers.size,
      });
    }

    // 2. Action: BROADCAST (Ivan's broadcast newsletter service)
    if (body.action === "broadcast") {
      const { subject, content } = body as BroadcastPayload;

      if (!subject || !content) {
        return NextResponse.json({ error: "Subject and content are required for broadcast" }, { status: 400 });
      }

      const subscriberList = Array.from(subscribers);
      console.log(`[Newsletter Broadcast] Sending '${subject}' to ${subscriberList.length} subscribers:`, subscriberList);

      return NextResponse.json({
        success: true,
        message: `Broadcast successfully sent to ${subscriberList.length} subscriber(s)!`,
        broadcast_date: new Date().toISOString(),
        recipients_count: subscriberList.length,
        subject,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
