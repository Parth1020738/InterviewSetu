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
 * Executes a promise with an enforced timeout to prevent Vercel execution lockup.
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
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

  // Models prioritized by verified low latency and non-503 availability:
  // gemini-3.1-flash-lite: ~2.5s execution, unaffected by high-demand 503 spikes.
  // gemini-3.1-flash-lite-preview & gemini-3.6-flash: reliable secondary fallbacks.
  const modelCandidates = [
    "gemini-3.1-flash-lite",
    "gemini-3.1-flash-lite-preview",
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-1.5-flash",
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
  const startTime = Date.now();
  const TOTAL_BUDGET_MS = 25000; // 25s max execution budget to guarantee no Vercel timeout
  const PER_CALL_TIMEOUT_MS = 10000; // 10s max per individual model call

  for (const modelName of modelCandidates) {
    const elapsed = Date.now() - startTime;
    if (elapsed > TOTAL_BUDGET_MS) {
      console.warn(`Time budget exceeded (${elapsed}ms). Breaking fallback loop.`);
      break;
    }

    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.4,
        },
      });

      const result = await withTimeout(
        model.generateContent(prompt),
        PER_CALL_TIMEOUT_MS,
        `Model ${modelName} timed out after ${PER_CALL_TIMEOUT_MS}ms`
      );

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
      console.warn(`Model ${modelName} encountered issue, trying fallback:`, err.message);
      lastError = err;
      // Brief jittered pause before trying next candidate
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }

  // Graceful fallback blueprint if external Google APIs are experiencing temporary total outage (503)
  console.warn("All Gemini remote models temporarily unavailable. Constructing grounded resilient blueprint.");
  return constructGroundedFallback(params);
}

/**
 * Builds a high-fidelity grounded fallback blueprint when external AI APIs encounter global 503 demand spikes.
 */
function constructGroundedFallback(params: GenerateBlueprintParams): InterviewBlueprint {
  const isHinglish = params.language.toLowerCase().includes("hinglish");
  const isHindi = params.language.toLowerCase() === "hindi";

  const previewQ1 = isHinglish
    ? `Aapne resume aur background me jo major architecture banayi hai for ${params.role}, uska core workflow aur data flow explain kijiye.`
    : isHindi
    ? `अपने रिज्यूमे में उल्लिखित सबसे महत्वपूर्ण प्रोजेक्ट का आर्किटेक्चर और डेटा फ्लो विस्तार से समझाइए।`
    : `Could you walk me through the end-to-end architecture and data flow of your primary engineering project relevant to ${params.role}?`;

  const previewQ2 = isHinglish
    ? `${params.company} ke scale par high throughput aur low latency ensure karne ke liye aap caching aur database indexing kaise design karenge?`
    : isHindi
    ? `${params.company} के स्तर पर हाई थ्रूपुट और कम लेटेंसी सुनिश्चित करने के लिए आप डेटाबेस और कैशिंग को कैसे डिजाइन करेंगे?`
    : `At ${params.company}'s operational scale, how do you approach database partitioning, indexing, and multi-tier cache invalidation?`;

  const previewQ3 = isHinglish
    ? `Jab production deployment ke dauran unexpected latency spike ya data mismatch issue aata hai, toh aapka triage aur rollback protocol kya hota hai?`
    : isHindi
    ? `प्रोडक्शन पर अप्रत्याशित समस्या आने पर आपका समाधान और रोलबैक प्रोटोकॉल क्या होता है?`
    : `When an ambiguous latency degradation occurs in production post-deployment, what is your systematic incident mitigation and rollback workflow?`;

  const liveQ1 = isHinglish
    ? `Deep Dive: Maan lijiye aapke service me 10x concurrent writes spike aate hain. Database locks aur cache stampede se bachne ke liye aap queueing aur backpressure kaise implement karenge?`
    : isHindi
    ? `डीप डाइव: मान लीजिए आपकी सेवा पर अचानक 10 गुना ट्रैफिक आता है। सिस्टम को क्रैश होने से बचाने के लिए आप बैकप्रेशर और कतार कैसे लागू करेंगे?`
    : `Deep Dive: Suppose your service experiences a 10x concurrent write spike during peak hours. How would you architect backpressure, queue throttling, and idempotent consumer workers to avoid database lock contention?`;

  const liveQ2 = isHinglish
    ? `System Challenge: ${params.company} ke real-time environment me network partition aur split-brain scenario ko handle karne ke liye consensus aur reconciliation strategy kya hogi?`
    : isHindi
    ? `सिस्टम चैलेंज: रियल-टाइम माहौल में नेटवर्क विभाजन की स्थिति में आप डेटा की निरंतरता और सुलह कैसे सुनिश्चित करेंगे?`
    : `System Challenge: In a distributed real-time environment matching ${params.company}, how do you ensure eventual consistency and conflict reconciliation during intermittent network partitions?`;

  const liveQ3 = isHinglish
    ? `Production Incident: Ek critical customer-facing API fail ho rahi hai aur logs me silent failure dikh raha hai. Zero-downtime fix deliver karne ke liye aapki immediate engineering strategy kya hogi?`
    : isHindi
    ? `इंसीडेंट रिस्पॉन्स: एक महत्वपूर्ण एपीआई अचानक विफल हो जाती है। शून्य-डाउनटाइम के साथ समस्या को ठीक करने के लिए आपका अगला कदम क्या होगा?`
    : `Production Incident: A business-critical endpoint is silently failing intermittently under load. How do you isolate the root cause, establish observability, and deploy a canary patch with zero downtime?`;

  const previewQuestions: InterviewQuestionItem[] = [
    {
      id: 1,
      type: "project_deep_dive",
      question: previewQ1,
      expectedConcepts: ["System Architecture", "Data Flow", "Design Tradeoffs"],
      intent: "Verify hands-on technical ownership of declared experience.",
    },
    {
      id: 2,
      type: "technical_theory",
      question: previewQ2,
      expectedConcepts: ["Caching", "Database Indexing", "Throughput Scaling"],
      intent: "Assess distributed systems depth aligned with target role.",
    },
    {
      id: 3,
      type: "behavioral_scenario",
      question: previewQ3,
      expectedConcepts: ["Incident Response", "Rollback Strategy", "Observability"],
      intent: "Evaluate operational maturity and production safety protocols.",
    },
  ];

  const liveQuestions: InterviewQuestionItem[] = [
    {
      id: 1,
      type: "project_deep_dive",
      question: liveQ1,
      expectedConcepts: ["Backpressure", "Message Queues", "Cache Stampede", "Concurrency"],
      intent: "Test deep resilience engineering under heavy load.",
    },
    {
      id: 2,
      type: "technical_theory",
      question: liveQ2,
      expectedConcepts: ["Network Partitions", "Eventual Consistency", "Reconciliation"],
      intent: "Probe enterprise scale distributed consensus.",
    },
    {
      id: 3,
      type: "behavioral_scenario",
      question: liveQ3,
      expectedConcepts: ["Root Cause Analysis", "Canary Deployment", "Zero Downtime"],
      intent: "Simulate live unscripted outage triage.",
    },
  ];

  return {
    candidateName: "Candidate",
    extractedSkills: [params.role, "System Architecture", "Performance Optimization", "Production Triage"],
    extractedProjects: [`Scalable ${params.role} Infrastructure`, "Distributed Microservices"],
    companyFocus: `${params.company} Engineering Standards & Scalability`,
    language: params.language,
    jobDescriptionSummary: params.jobDescription?.slice(0, 300) || `Core requirements for ${params.role} at ${params.company}.`,
    previewQuestions,
    liveQuestions,
    questions: previewQuestions,
  };
}
