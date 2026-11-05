import { NextRequest, NextResponse } from "next/server";
import { generateInterviewBlueprint } from "@/lib/gemini";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_PDF_BYTES = 5 * 1024 * 1024; // 5MB limit
const MAX_TEXT_LENGTH = 15000; // 15,000 characters limit

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let resumeText = "";
    let jobDescription = "";
    let company = "Tech Startup";
    let role = "Fullstack Developer";
    let language = "Hinglish";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData().catch(() => null);
      if (!formData) {
        return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
      }

      const file = formData.get("resume") as File | null;
      company = (formData.get("company") as string)?.slice(0, 100) || company;
      role = (formData.get("role") as string)?.slice(0, 100) || role;
      language = (formData.get("language") as string)?.slice(0, 50) || language;
      const textParam = formData.get("resumeText") as string | null;
      const jdParam = formData.get("jobDescription") as string | null;

      if (jdParam) {
        jobDescription = jdParam.slice(0, MAX_TEXT_LENGTH);
      }

      if (file && file.size > 0) {
        if (file.size > MAX_PDF_BYTES) {
          return NextResponse.json(
            { error: "Resume file exceeds maximum allowable size of 5MB." },
            { status: 413 }
          );
        }

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
      resumeText = typeof body.resumeText === "string" ? body.resumeText : "";
      jobDescription = typeof body.jobDescription === "string" ? body.jobDescription : "";
      company = typeof body.company === "string" ? body.company.slice(0, 100) : company;
      role = typeof body.role === "string" ? body.role.slice(0, 100) : role;
      language = typeof body.language === "string" ? body.language.slice(0, 50) : language;
    }

    // Safety validation & truncation
    if (resumeText.length > MAX_TEXT_LENGTH) {
      resumeText = resumeText.slice(0, MAX_TEXT_LENGTH);
    }
    if (jobDescription.length > MAX_TEXT_LENGTH) {
      jobDescription = jobDescription.slice(0, MAX_TEXT_LENGTH);
    }

    // If candidate provided neither resume nor JD, default to a sensible software engineering baseline
    if (!resumeText.trim() && !jobDescription.trim()) {
      resumeText = "Software Engineering Candidate with experience in React, Node.js, distributed caches, and databases.";
    }

    const blueprint = await generateInterviewBlueprint({
      resumeText,
      jobDescription,
      company,
      role,
      language,
    });

    return NextResponse.json(
      {
        success: true,
        blueprint,
      },
      {
        status: 200,
        headers: {
          "X-Content-Type-Options": "nosniff",
        },
      }
    );
  } catch (error: any) {
    console.error("API /api/blueprint error:", error?.message || error);
    return NextResponse.json(
      {
        error: "Failed to generate interview blueprint. Please try again.",
      },
      { status: 500 }
    );
  }
}
