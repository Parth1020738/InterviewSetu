# Product Requirements Document (PRD)

## Project: InterviewSetu
**Tagline:** Context-Grounded Multilingual AI Voice Interviewer  
**Platform:** Enterprise Voice Terminal & AI Interview Simulation Platform  
**Primary Integration:** Gnani AI (Prisma STT + Timbre TTS) & Gemini 1.5 Flash

---

## 1. Problem Statement
Tier-2/3 college candidates across India often fail technical interviews not because they lack coding or systems knowledge, but because:
1. They are forced into strict corporate English and stumble when expressing complex logic.
2. Standard mock interview platforms ask generic trivia instead of grilling them on their specific project contributions and past company question patterns.
3. Commercial interview simulators ignore Indian accents and Hinglish (code-mixed) technical dialogue.

## 2. Target Persona
- **Who:** Engineering students and fresh graduates applying for internships or SDE-1 / Data Analyst / QA roles.
- **Languages:** Hinglish, Indian English, Hindi, and regional Indic dialects.
- **Pain Point:** Nervousness in spoken rounds; inability to simulate high-pressure voice interviews tailored to their resume and dream companies.

## 3. Core Features (Strict MVP Scope)

### F1: Candidate Context Setup
- Upload Resume (PDF format, parsed client-side/edge).
- Company Selection (e.g., TCS, Infosys, Swiggy, Google, Zomato, Startup).
- Role Selection (e.g., Frontend React, Backend Node/Java, Fullstack, Data Analyst).
- Language Choice (English, Hinglish, Hindi, Gujarati, Tamil).

### F2: Dynamic Interview Blueprinting
- LLM extracts actual resume projects, tools, and technical claims.
- Merges project details with typical company-specific interview themes.
- Prepares a 3-question adaptive conversational path (1 Project Deep Dive, 1 System/Coding Theory, 1 Behavioral/Company-fit).

### F3: Live Multilingual Voice Pipeline
- **AI Asks:** Spoken out loud using Gnani Timbre TTS (realistic Indian accents).
- **Candidate Answers:** Captured via browser microphone and sent as audio chunks/blobs.
- **Transcription:** Gnani Prisma STT converts speech to text with full code-mixed (Hinglish/Indic) support.
- **Live Interaction Loop:** Adaptive follow-up question if the candidate’s answer is incomplete.

### F4: Comprehensive Scorecard & Defense Report
- **Company Readiness Score** (0–100).
- **Resume Defense Score:** Did the candidate accurately explain what is written on their CV?
- **Communication & Delivery:** Fluency, pacing, and filler word detection.
- **Actionable Correction:** What to study before the actual round.

## 4. Success Metrics
- **End-to-End Latency:** < 2.5s between candidate finishing speech and Timbre speaking the next question.
- **Indic/Hinglish Accuracy:** Zero STT crashes on mixed technical terms (e.g., "React hook", "database query").
- **Demo Appeal:** Clean 60-second video demo showing dynamic voice conversation.