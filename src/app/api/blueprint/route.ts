import { NextRequest, NextResponse } from "next/server";
import { generateInterviewBlueprint } from "@/lib/gemini";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let resumeText = "";
    let company = "Tech Startup";
    let role = "Fullstack Developer";
    let language = "Hinglish";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("resume") as File | null;
      company = (formData.get("company") as string) || company;
      role = (formData.get("role") as string) || role;
      language = (formData.get("language") as string) || language;
      const textParam = formData.get("resumeText") as string | null;

      if (file && file.size > 0) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        try {
          // Dynamic require for CommonJS pdf-parse module in Next.js
          const pdfParse = require("pdf-parse");
          const parsed = await pdfParse(buffer);
          resumeText = parsed.text;
        } catch (pdfErr) {
          console.warn("Failed to extract PDF text via pdf-parse, using fallback text:", pdfErr);
          resumeText = textParam || file.name;
        }
      } else if (textParam) {
        resumeText = textParam;
      }
    } else {
      const body = await req.json().catch(() => ({}));
      resumeText = body.resumeText || "";
      company = body.company || company;
      role = body.role || role;
      language = body.language || language;
    }

    if (!resumeText.trim()) {
      resumeText = "Software Engineering Intern with experience in React, Node.js, REST APIs, and SQL.";
    }

    const blueprint = await generateInterviewBlueprint({
      resumeText,
      company,
      role,
      language,
    });

    return NextResponse.json({
      success: true,
      blueprint,
    });
  } catch (error: any) {
    console.error("API /api/blueprint error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to generate interview blueprint with Gemini.",
      },
      { status: 500 }
    );
  }
}
