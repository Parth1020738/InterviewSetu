import { NextRequest, NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/gnani";

export const dynamic = "force-dynamic";

const MAX_AUDIO_BYTES = 10 * 1024 * 1024; // 10MB limit

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData().catch(() => null);

    if (!formData) {
      return NextResponse.json(
        { error: "Expected multipart/form-data with 'audio_file' or 'audio'." },
        { status: 400 }
      );
    }

    const audioEntry = formData.get("audio_file") || formData.get("audio");
    if (!audioEntry) {
      return NextResponse.json(
        { error: "Missing audio recording in form data ('audio_file' or 'audio')." },
        { status: 400 }
      );
    }

    // Safety validation: file size limit
    if (audioEntry instanceof Blob && audioEntry.size > MAX_AUDIO_BYTES) {
      return NextResponse.json(
        { error: "Audio file exceeds maximum allowable size of 10MB." },
        { status: 413 }
      );
    }

    const result = await transcribeAudio(formData);

    return NextResponse.json(result, {
      status: 200,
      headers: {
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error: any) {
    console.error("API /api/stt error:", error?.message || error);
    // Sanitize error: never leak upstream credentials or raw stack traces
    return NextResponse.json(
      {
        error: "Failed to transcribe audio. Please verify server credentials and try again.",
      },
      { status: 500 }
    );
  }
}
