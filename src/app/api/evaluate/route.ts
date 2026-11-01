import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = "force-dynamic";

export interface EvaluationPayload {
  score: {
    technical: number;
    communication: number;
    resumeDefense: number;
  };
  verbalFeedback: string;
  nextAction: "follow_up" | "next_question" | "complete";
  followUpQuestion?: string;
  keyStrengths: string[];
  areasToImprove: string[];
}

const MAX_QUESTION_CHARS = 1000;
const MAX_ANSWER_CHARS = 5000;
const MAX_CONTEXT_CHARS = 10000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (
      !body ||
      typeof body.currentQuestion !== "string" ||
      !body.currentQuestion.trim() ||
      typeof body.candidateAnswer !== "string" ||
      !body.candidateAnswer.trim()
    ) {
      return NextResponse.json(
        { error: "Fields 'currentQuestion' and 'candidateAnswer' are required non-empty strings." },
        { status: 400 }
      );
    }

    // Input length limits
    const currentQuestion = body.currentQuestion.slice(0, MAX_QUESTION_CHARS);
    const candidateAnswer = body.candidateAnswer.slice(0, MAX_ANSWER_CHARS);
    const resumeContext = typeof body.resumeContext === "string" ? body.resumeContext.slice(0, MAX_CONTEXT_CHARS) : "";
    const company = typeof body.company === "string" ? body.company.slice(0, 100) : "Tech Firm";
    const role = typeof body.role === "string" ? body.role.slice(0, 100) : "Software Engineer";
    const language = typeof body.language === "string" ? body.language.slice(0, 50) : "Hinglish";
    const questionIndex = typeof body.questionIndex === "number" ? Math.max(0, body.questionIndex) : 0;
    const totalQuestions = typeof body.totalQuestions === "number" ? Math.max(1, body.totalQuestions) : 3;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY in server environment.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelCandidates = [
      "gemini-3.5-flash-lite",
      "gemini-3.8-flash",
      "gemini-1.5-flash",
    ];

    const isFinalQuestion = questionIndex >= totalQuestions - 1;

    const prompt = `
You are a senior engineering interviewer evaluating a candidate for the role of "${role}" at "${company}".
The interview language is "${language}".

CANDIDATE RESUME CONTEXT:
"""
${resumeContext || "Candidate with software engineering experience."}
"""

QUESTION ASKED:
"${currentQuestion}"

CANDIDATE SPOKEN ANSWER (Transcribed):
"${candidateAnswer}"

CURRENT QUESTION INDEX: ${questionIndex + 1} of ${totalQuestions}.
IS FINAL QUESTION: ${isFinalQuestion}

YOUR TASK:
1. Objectively evaluate the candidate's answer across 3 dimensions (0 to 100):
   - technical: Technical depth, correctness, architectural rationale.
   - communication: Clarity, fluency, structure, tone.
   - resumeDefense: Did they demonstrate genuine hands-on ownership of what is stated in their resume/claims?
2. Determine nextAction:
   - If IS FINAL QUESTION is true, nextAction MUST be "complete".
   - If the candidate's answer was too vague or missed an essential detail, AND this is not already a follow-up, you may choose "follow_up" and provide a concise "followUpQuestion".
   - Otherwise, choose "next_question" (if questionIndex < totalQuestions - 1) or "complete".
3. Formulate a short, natural verbal feedback (1-2 sentences):
   - It will be spoken out loud via Gnani Timbre TTS to the candidate.
   - Make it constructive, conversational, and respectful.
   - If language is "Hinglish", write natural conversational Hinglish (e.g., "Bahut badhiya explanation, especially cache sync ka part. Chaliye ab next question par chalte hain.").
   - If language is "Hindi", write natural Hindi.
   - If language is "English", write natural conversational English.
4. If nextAction is "follow_up", write "followUpQuestion" in the same language.

OUTPUT SCHEMA (STRICT JSON ONLY):
{
  "score": {
    "technical": number,
    "communication": number,
    "resumeDefense": number
  },
  "verbalFeedback": "string",
  "nextAction": "follow_up" | "next_question" | "complete",
  "followUpQuestion": "string (optional)",
  "keyStrengths": ["string"],
  "areasToImprove": ["string"]
}
`;

    let evaluationResult: EvaluationPayload | null = null;
    let lastError: any = null;

    for (const modelName of modelCandidates) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.3,
          },
        });

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        evaluationResult = JSON.parse(text) as EvaluationPayload;
        break;
      } catch (err: any) {
        console.warn(`Evaluation model ${modelName} failed, trying fallback:`, err.message);
        lastError = err;
      }
    }

    if (!evaluationResult) {
      throw new Error(`Failed to evaluate answer with Gemini: ${lastError?.message}`);
    }

    return NextResponse.json(
      {
        success: true,
        evaluation: evaluationResult,
      },
      {
        status: 200,
        headers: {
          "X-Content-Type-Options": "nosniff",
        },
      }
    );
  } catch (error: any) {
    console.error("API /api/evaluate error:", error?.message || error);
    return NextResponse.json(
      {
        error: "Failed to evaluate candidate response. Please try again.",
      },
      { status: 500 }
    );
  }
}
