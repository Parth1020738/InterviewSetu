import { NextRequest, NextResponse } from "next/server";
import { synthesizeSpeech } from "@/lib/gnani";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || !body.text || typeof body.text !== "string") {
      return NextResponse.json(
        { error: "Field 'text' is required and must be a string." },
        { status: 400 }
      );
    }

    const { text, language = "hi", voice = "Nalini" } = body;

    const audioBuffer = await synthesizeSpeech(text, language, voice);

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": audioBuffer.byteLength.toString(),
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("API /api/tts error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to synthesize speech using Gnani Timbre.",
      },
      { status: 500 }
    );
  }
}
