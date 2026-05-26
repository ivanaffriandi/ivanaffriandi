import { NextRequest, NextResponse } from "next/server";

// ─── ElevenLabs voice IDs ───────────────────────────────────────────────────
// eleven_multilingual_v2 handles Dutch, Indonesian, English natively
const VOICE_ID = "pNInz6obpgDQGcFmaJgB"; // Adam — deep, warm audiobook voice
const MODEL_ID = "eleven_multilingual_v2";

// ─── Simple language detector ─────────────────────────────────────────────────
function detectLang(text: string): "nl" | "id" | "en" {
  const lower = text.toLowerCase().slice(0, 1000);

  const nlScore = (lower.match(/\b(de|het|een|van|in|is|dat|niet|zijn|ik|voor|op|te|met|maar|ook|aan|bij|door)\b/g) || []).length;
  const idScore = (lower.match(/\b(yang|dan|di|ini|itu|dengan|untuk|dalam|tidak|juga|ke|pada|ada|saya|lebih|sudah|dari|bisa|akan|karena)\b/g) || []).length;

  if (nlScore > idScore && nlScore > 2) return "nl";
  if (idScore > nlScore && idScore > 2) return "id";
  return "en";
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey || apiKey === "your_api_key_here") {
    return NextResponse.json(
      { error: "ElevenLabs API key not configured. Add ELEVENLABS_API_KEY to .env.local" },
      { status: 503 }
    );
  }

  let body: { text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rawText = body.text?.trim();
  if (!rawText) {
    return NextResponse.json({ error: "No text provided" }, { status: 400 });
  }

  // Truncate to ~4 800 chars to stay within free-tier per-request limit
  const text = rawText.length > 4800 ? rawText.slice(0, 4800) + "…" : rawText;
  const lang = detectLang(text);

  try {
    const elRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: MODEL_ID,
          language_code: lang,
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.82,
            style: 0.15,          // subtle expressiveness
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!elRes.ok) {
      const errText = await elRes.text();
      console.error("[TTS] ElevenLabs error:", elRes.status, errText);
      return NextResponse.json(
        { error: `ElevenLabs error: ${elRes.status}` },
        { status: 502 }
      );
    }

    const audioBuffer = await elRes.arrayBuffer();
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
        "X-Detected-Lang": lang,
      },
    });
  } catch (err) {
    console.error("[TTS] fetch error:", err);
    return NextResponse.json({ error: "TTS request failed" }, { status: 500 });
  }
}
