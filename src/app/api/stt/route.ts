import { NextRequest, NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/gnani";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData().catch(() => null);

    if (!formData) {
      return NextResponse.json(
        { error: "Expected multipart/form-data with 'audio_file' or 'audio'." },
        { status: 400 }
      );
    }

    const hasAudio = formData.has("audio_file") || formData.has("audio");
    if (!hasAudio) {
      return NextResponse.json(
        { error: "Missing audio recording in form data ('audio_file' or 'audio')." },
        { status: 400 }
      );
    }

    const result = await transcribeAudio(formData);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("API /api/stt error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to transcribe audio with Gnani Prisma.",
      },
      { status: 500 }
    );
  }
}
