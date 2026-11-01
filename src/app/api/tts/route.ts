import { NextRequest, NextResponse } from "next/server";
import { synthesizeSpeech } from "@/lib/gnani";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body.text !== "string" || !body.text.trim()) {
      return NextResponse.json(
        { error: "Field 'text' is required and must be a non-empty string." },
        { status: 400 }
      );
    }

    // Safety validation: limit text size to 2,000 characters
    if (body.text.length > 2000) {
      return NextResponse.json(
        { error: "Input text exceeds maximum allowable length of 2000 characters." },
        { status: 400 }
      );
    }

    const text = body.text.trim();
    const language = typeof body.language === "string" ? body.language.slice(0, 30) : "hi";
    const voice = typeof body.voice === "string" ? body.voice.slice(0, 50) : "Nalini";

    const audioBuffer = await synthesizeSpeech(text, language, voice);

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": audioBuffer.byteLength.toString(),
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error: any) {
    console.error("API /api/tts error:", error?.message || error);
    // Sanitize error: never leak upstream credentials or raw stack traces
    return NextResponse.json(
      {
        error: "Failed to synthesize speech audio. Please verify server credentials and try again.",
      },
      { status: 500 }
    );
  }
}
