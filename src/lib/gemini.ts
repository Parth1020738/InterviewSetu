import { GoogleGenerativeAI } from "@google/generative-ai";

export interface InterviewBlueprint {
  candidateName: string;
  extractedSkills: string[];
  extractedProjects: string[];
  companyFocus: string;
  language: string;
  questions: {
    id: number;
    type: "project_deep_dive" | "technical_theory" | "behavioral_scenario";
    question: string;
    expectedConcepts: string[];
    intent: string;
  }[];
}

/**
 * Generates an adaptive 3-question interview blueprint based on candidate resume and target company.
 */
export async function generateInterviewBlueprint(params: {
  resumeText: string;
  company: string;
  role: string;
  language: string;
}): Promise<InterviewBlueprint> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY in server environment.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  // Preferred fast production models
  const modelCandidates = [
    "gemini-3.5-flash-lite",
    "gemini-3.8-flash",
    "gemini-1.5-flash",
  ];

  const prompt = `
You are an expert technical interviewer at "${params.company}" conducting a first-round spoken screening for the role of "${params.role}".
The candidate prefers to communicate in "${params.language}".

Here is the candidate's extracted resume text:
"""
${params.resumeText || "No resume provided. Candidate claims familiarity with web development, data structures, and APIs."}
"""

YOUR TASK:
1. Extract candidate's name, primary skills, and project highlights from the resume.
2. Formulate a 3-question sequential interview blueprint specifically targeted to ${params.company}'s engineering expectations and the candidate's actual projects:
   - Question 1: Project Deep Dive (Grill them on a specific architectural decision, bug, database choice, or metric mentioned in their resume).
   - Question 2: Technical/System Theory (Ask a core CS/engineering question relevant to ${params.company}'s scale, e.g. concurrency, caching, latency, indexing, state management).
   - Question 3: Behavioral / Incident Scenario (A practical debugging or team conflict scenario tailored to ${params.company}'s culture).

Language guidelines:
- If language is "Hinglish", write questions in natural conversational Hinglish (e.g., "Aapne resume me likha hai ki aapne Redis use kiya tha caching ke liye. Can you explain cache invalidation kaise handle kiya?").
- If language is "Hindi", write natural, professional Hindi.
- If language is "English", write professional conversational English.

OUTPUT SCHEMA (STRICT JSON ONLY):
{
  "candidateName": "string",
  "extractedSkills": ["string"],
  "extractedProjects": ["string"],
  "companyFocus": "string",
  "language": "${params.language}",
  "questions": [
    {
      "id": 1,
      "type": "project_deep_dive",
      "question": "string (the actual spoken question to candidate)",
      "expectedConcepts": ["string"],
      "intent": "string (what the interviewer is evaluating)"
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
          temperature: 0.4,
        },
      });

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const parsed: InterviewBlueprint = JSON.parse(responseText);
      return parsed;
    } catch (err: any) {
      console.warn(`Model ${modelName} failed or unavailable, trying fallback:`, err.message);
      lastError = err;
    }
  }

  throw new Error(`Failed to generate blueprint with Gemini: ${lastError?.message || "Unknown error"}`);
}
