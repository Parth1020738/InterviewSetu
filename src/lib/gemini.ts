import { GoogleGenerativeAI } from "@google/generative-ai";

export interface InterviewQuestionItem {
  id: number;
  type: "project_deep_dive" | "technical_theory" | "behavioral_scenario";
  question: string;
  expectedConcepts: string[];
  intent: string;
}

export interface InterviewBlueprint {
  candidateName: string;
  extractedSkills: string[];
  extractedProjects: string[];
  companyFocus: string;
  language: string;
  jobDescriptionSummary?: string;
  previewQuestions: InterviewQuestionItem[];
  liveQuestions: InterviewQuestionItem[];
  /** Alias for previewQuestions for backward-compatibility */
  questions: InterviewQuestionItem[];
}

export interface GenerateBlueprintParams {
  resumeText?: string;
  jobDescription?: string;
  company: string;
  role: string;
  language: string;
}

/**
 * Generates an adaptive interview blueprint containing:
 * 1. previewQuestions: 3 initial screening questions for onboarding review.
 * 2. liveQuestions: 3 fresh, deeper, non-verbatim live interview questions tailored to the Resume + Job Description.
 */
export async function generateInterviewBlueprint(
  params: GenerateBlueprintParams
): Promise<InterviewBlueprint> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY in server environment.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const modelCandidates = [
    "gemini-3.5-flash",
    "gemini-3.8-flash",
    "gemini-3.5-flash-lite",
    "gemini-flash-latest",
  ];

  const resumeSection = params.resumeText?.trim()
    ? `CANDIDATE RESUME / CV TEXT:
"""
${params.resumeText.trim()}
"""`
    : `CANDIDATE RESUME / CV TEXT:
[No resume provided by candidate. Rely strictly on the Job Description and standard technical expectations for this role.]`;

  const jdSection = params.jobDescription?.trim()
    ? `TARGET JOB DESCRIPTION (JD):
"""
${params.jobDescription.trim()}
"""`
    : `TARGET JOB DESCRIPTION (JD):
[No explicit JD provided. Calibrate expectations to standard industry requirements for ${params.role} at ${params.company}.]`;

  const prompt = `
You are an expert technical hiring manager at "${params.company}" designing an interview pipeline for the role of "${params.role}".
The interview language is "${params.language}".

${resumeSection}

${jdSection}

YOUR TASK:
1. Candidate Profiling:
   - Extract candidate's name (or default to "Candidate"), primary skills, and project highlights from the resume (or inferred from the role).
   - If a Job Description is provided, generate a concise summary of the core expectations.
   - If no resume is uploaded, base all questions directly on the Job Description and company scale.

2. Generate TWO DISTINCT SETS OF QUESTIONS:
   
   A. PREVIEW / SCREENING QUESTIONS ("previewQuestions" - 3 questions):
      - These are for candidate onboarding review to set clear topical expectations.
      - Q1: High-level overview of a major resume project or core domain expertise.
      - Q2: Foundational CS or system concept directly required by the JD/company.
      - Q3: General situational or collaborative scenario.

   B. LIVE INTERVIEW QUESTIONS ("liveQuestions" - 3 questions):
      - CRITICAL: These must NOT reuse the preview questions verbatim.
      - They must be fresh, dynamic, and significantly deeper, specifically probing the intersection of what the candidate claims and what the Job Description demands.
      - Q1 (Deeper Project Drill-down): Probe an unscripted edge case, scaling bottleneck, data consistency compromise, or failure mode in the candidate's actual projects.
      - Q2 (Live System Challenge): Present a practical, high-throughput production architecture or coding dilemma matching ${params.company}'s actual scale and the JD's technology stack.
      - Q3 (Pragmatic Fire Drill): Present an unscripted cross-functional crisis, production outage rollback, or ambiguous engineering trade-off.

Language guidelines:
- If language is "Hinglish", write both sets in natural, professional conversational Hinglish (e.g., "Aapne resume me Redis use kiya tha chat service me. Jab high concurrent writes aate hain, toh cache stampede aur invalidation kaise handle kiya?").
- If language is "Hindi", write natural, professional Hindi.
- If language is "English", write crisp, conversational Indian/Global tech English.

OUTPUT SCHEMA (STRICT JSON ONLY):
{
  "candidateName": "string",
  "extractedSkills": ["string"],
  "extractedProjects": ["string"],
  "companyFocus": "string",
  "language": "${params.language}",
  "jobDescriptionSummary": "string",
  "previewQuestions": [
    {
      "id": 1,
      "type": "project_deep_dive",
      "question": "string (preview screening question for onboarding)",
      "expectedConcepts": ["string"],
      "intent": "string"
    },
    {
      "id": 2,
      "type": "technical_theory",
      "question": "string",
      "expectedConcepts": ["string"],
      "intent": "string"
    },
    {
      "id": 3,
      "type": "behavioral_scenario",
      "question": "string",
      "expectedConcepts": ["string"],
      "intent": "string"
    }
  ],
  "liveQuestions": [
    {
      "id": 1,
      "type": "project_deep_dive",
      "question": "string (fresh, non-verbatim deeper live interview question)",
      "expectedConcepts": ["string"],
      "intent": "string"
    },
    {
      "id": 2,
      "type": "technical_theory",
      "question": "string (fresh scenario grounded in JD requirements)",
      "expectedConcepts": ["string"],
      "intent": "string"
    },
    {
      "id": 3,
      "type": "behavioral_scenario",
      "question": "string (fresh live incident / trade-off challenge)",
      "expectedConcepts": ["string"],
      "intent": "string"
    }
  ]
}
`;

  let lastError: any = null;

  for (const modelName of modelCandidates) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.45,
        },
      });

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const parsed = JSON.parse(responseText) as InterviewBlueprint;

      // Ensure fallback safety if model returned legacy shape
      if (!parsed.previewQuestions && (parsed as any).questions) {
        parsed.previewQuestions = (parsed as any).questions;
      }
      if (!parsed.liveQuestions) {
        parsed.liveQuestions = parsed.previewQuestions;
      }
      // Populate alias for backward compatibility
      parsed.questions = parsed.previewQuestions;

      return parsed;
    } catch (err: any) {
      console.warn(`Model ${modelName} failed or unavailable, trying fallback:`, err.message);
      lastError = err;
      // Brief pause before trying next candidate model
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
  }

  throw new Error(`Failed to generate blueprint with Gemini: ${lastError?.message || "Unknown error"}`);
}
