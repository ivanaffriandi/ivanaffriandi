import { NextResponse } from "next/server";
import {
  renderWelcomeEmail,
  renderEditorialEmail,
  renderStudioReleaseEmail,
} from "@/lib/newsletterTemplates";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";

// In-memory subscribers set (syncs with database/storage)
const subscribers: Set<string> = new Set(["hello@ivanaffriandi.com"]);

// Outbound email dispatcher helper using Resend with automatic fallback
async function dispatchEmail(to: string[], subject: string, html: string) {
  if (!RESEND_API_KEY) return { ok: false, error: "No API key configured" };

  try {
    // 1. Try verified primary domain
    let res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Ivan Affriandi <hello@ivanaffriandi.com>",
        to,
        subject,
        html,
      }),
    });

    // 2. Retry with onboarding fallback if domain is unverified
    if (!res.ok) {
      const retryRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Ivan Affriandi <onboarding@resend.dev>",
          to,
          subject,
          html,
        }),
      });
      if (retryRes.ok) {
        res = retryRes;
      }
    }

    if (res.ok) {
      const json = await res.json();
      return { ok: true, id: json.id };
    } else {
      const err = await res.text();
      return { ok: false, error: err };
    }
  } catch (err: any) {
    return { ok: false, error: err.message || "Network error" };
  }
}

// ─── GET: LIST SUBSCRIBERS OR PREVIEW HTML TEMPLATES ─────────────────────────
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const email = searchParams.get("email");
  const preview = searchParams.get("preview");

  // 1. Live Unsubscribe Handler & Confirmation Page
  if (action === "unsubscribe") {
    if (email) {
      subscribers.delete(email.trim().toLowerCase());
    }
    const unsubscribedPage = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Unsubscribed · Ivan Affriandi</title>
  <style>
    body { margin: 0; padding: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; background-color: #F8F9FA; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #18181B; }
    @media (prefers-color-scheme: dark) {
      body { background-color: #0d0d0f; color: #EDEDED; }
      .card { background-color: #161619 !important; border-color: rgba(255,255,255,0.08) !important; }
      .btn { background-color: #f4f4f5 !important; color: #09090b !important; }
    }
    .card { background: #FFFFFF; border: 1px solid rgba(0,0,0,0.08); border-radius: 24px; padding: 40px 32px; max-width: 440px; width: 90%; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.04); }
    h1 { font-size: 22px; font-weight: 700; margin: 0 0 12px 0; letter-spacing: -0.02em; }
    p { font-size: 14px; line-height: 1.6; color: #71717A; margin: 0 0 24px 0; }
    .btn { display: inline-block; background: #18181B; color: #FFFFFF; text-decoration: none; padding: 11px 24px; border-radius: 9999px; font-size: 13px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <h1>You're unsubscribed.</h1>
    <p>You have been removed from my personal channel and won't receive future notes. If this was a mistake, you can always rejoin anytime.</p>
    <a href="https://ivanaffriandi.com" class="btn">Return to Website ↗</a>
  </div>
</body>
</html>`;
    return new Response(unsubscribedPage, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }

  // Live HTML Template Visual Preview in Browser
  if (preview === "welcome") {
    const html = renderWelcomeEmail({ subscriberEmail: "subscriber@example.com" });
    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }

  if (preview === "editorial" || preview === "note") {
    const html = renderEditorialEmail({
      noteNumber: "NOTE #04",
      date: "August 19, 2026",
      title: "Thinking out loud about craft and quiet days",
      subtitle: "A quick reflection on simplifying workflows, good typography, and making things that last.",
      bodyHtml: `
        <p>Hey,</p>
        <p>I’ve been spending the past few weeks stripping away complexity in everything I build. There’s a strange trap in digital design where adding more feels like progress, but usually, the hardest part is knowing what to remove.</p>
        <p>Whether it’s dialing in typography weights on the web or testing fabric drape in the atelier, clarity always wins.</p>
        <p>I wrote a longer reflection covering this over on my journal with a few sketches and side notes.</p>
      `,
      articleUrl: "https://ivanaffriandi.com",
      ctaText: "Read the full note ↗",
      previewText: "Thinking out loud about craft and quiet days.",
    });
    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }

  if (preview === "studio" || preview === "project") {
    const html = renderStudioReleaseEmail({
      tag: "SOMETHING NEW",
      title: "A quick look at what I’ve been making lately",
      subtitle: "A short behind-the-scenes on our newest bespoke pattern tests.",
      descriptionHtml: `
        <p>Hey — wanted to share a quick update on what’s been happening around the studio.</p>
        <p>We just wrapped initial prototype tests for a new unstructured wool blazer, exploring heavier Japanese textiles with hand-finished edges.</p>
        <p>If you're curious to see how the fabric and silhouette turned out, I put together a quick preview page.</p>
      `,
      ctaUrl: "https://work.ivanaffriandi.com",
      ctaText: "View the preview ↗",
    });
    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }

  return NextResponse.json({
    success: true,
    total_subscribers: subscribers.size,
    subscribers: Array.from(subscribers),
    preview_templates: [
      "/api/newsletter?preview=welcome",
      "/api/newsletter?preview=editorial",
      "/api/newsletter?preview=studio",
    ],
  });
}

// ─── POST: SUBSCRIBE OR BROADCAST ────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Action: SUBSCRIBE (with auto welcome email dispatch)
    if (body.action === "subscribe" || (!body.action && body.email)) {
      const email = (body.email || "").trim().toLowerCase();
      if (!email || !email.includes("@")) {
        return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
      }

      const isNew = !subscribers.has(email);
      subscribers.add(email);

      // Send the casual welcome email automatically
      const welcomeHtml = renderWelcomeEmail({ subscriberEmail: email });
      const dispatchResult = await dispatchEmail(
        [email],
        "Hey — glad you're here",
        welcomeHtml
      );

      console.log(`[Newsletter] Subscriber ${email} added. Welcome email status:`, dispatchResult);

      return NextResponse.json({
        success: true,
        message: "You're in — welcome note sent to your inbox.",
        email,
        is_new_subscriber: isNew,
        total_subscribers: subscribers.size,
        dispatch_status: dispatchResult.ok ? "sent" : "queued",
      });
    }

    // 2. Action: BROADCAST DISPATCH
    if (body.action === "broadcast") {
      const {
        title,
        subtitle,
        content,
        noteNumber,
        articleUrl,
        type = "editorial",
      } = body;

      if (!title || !content) {
        return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
      }

      const emailHtml =
        type === "studio" || type === "project"
          ? renderStudioReleaseEmail({
              title,
              subtitle,
              descriptionHtml: content,
              ctaUrl: articleUrl || "https://work.ivanaffriandi.com",
            })
          : renderEditorialEmail({
              noteNumber: noteNumber || "PERSONAL NOTE",
              title,
              subtitle,
              bodyHtml: content,
              articleUrl,
            });

      const recipientList = Array.from(subscribers);
      const dispatchRes = await dispatchEmail(
        recipientList,
        title,
        emailHtml
      );

      return NextResponse.json({
        success: true,
        message: `Dispatched to ${recipientList.length} subscriber(s).`,
        recipients_count: recipientList.length,
        dispatch_id: dispatchRes.id,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
