# System Architecture & Technical Specifications

## 1. High-Level Architecture Flow

[Candidate Browser]
│
├─► 1. Upload Resume + Select Company & Language
│         │
│         ▼
├─► 2. Next.js Edge Route (/api/blueprint)
│         │ ───► Gemini 1.5 Flash (Generates tailored 3-question blueprint)
│         ◄─── Returns Question 1 text
│
├─► 3. Next.js TTS Route (/api/tts)
│         │ ───► Gnani Timbre API (https://api.vachana.ai/api/v1/tts/inference)
│         ◄─── Returns Audio (WAV/Linear PCM)
│
├─► 4. Candidate Speaks into Mic (MediaRecorder API -> audio/webm or wav)
│         │
│         ▼
├─► 5. Next.js STT Route (/api/stt)
│         │ ───► Gnani Prisma API (prisma-v3.0 / indic-auto)
│         ◄─── Returns Transcript (Text with Hinglish support)
│
├─► 6. Next.js Evaluate Route (/api/evaluate)
│         │ ───► Gemini 1.5 Flash (Scores answer, decides next question/follow-up)
│         ◄─── Returns Feedback + Next Question
│
└─► 7. Repeat steps 3-6 until complete -> Generate Final Scorecard (/api/report)


## 2. Tech Stack
- **Framework:** Next.js 14/15 (App Router, TypeScript).
- **Styling:** Tailwind CSS + Radix UI Primitives (Lucide Icons, Framer Motion for waveforms).
- **Database / Storage:** Supabase (PostgreSQL for session logs, Storage for resumes if required).
- **AI Core:**
  - **Speech-to-Text:** Gnani Prisma v3.0 / v2.5 (`https://docs.gnani.ai/api/STT/models/prisma-v3`).
  - **Text-to-Speech:** Gnani Timbre v2.5 (`https://api.vachana.ai/api/v1/tts/inference`).
  - **Reasoning & Question Blueprinting:** Google Gemini 1.5 Flash.
- **Deployment:** Vercel.

## 3. Directory & File Structure

```text
interviewsetu/
├── .env.local                  # GNANI_API_KEY,
├── prd.md
├── architecture.md
├── rules.md
├── phase.md
├── design.md
├── memory.md
├── package.json
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Hero & Onboarding (Upload Resume, Select Company)
│   │   ├── interview/
│   │   │   └── page.tsx        # The Live Voice Studio
│   │   ├── report/
│   │   │   └── page.tsx        # Scorecard & Performance Analytics
│   │   └── api/
│   │       ├── blueprint/
│   │       │   └── route.ts    # Parse resume & build company-specific questions
│   │       ├── stt/
│   │       │   └── route.ts    # Proxy audio to Gnani Prisma STT
│   │       ├── tts/
│   │       │   └── route.ts    # Proxy text to Gnani Timbre TTS
│   │       └── evaluate/
│   │           └── route.ts    # Answer analysis & next question generation
│   ├── components/
│   │   ├── AudioWaveform.tsx   # Canvas/CSS visualizer for speaking/listening states
│   │   ├── CompanySelector.tsx # Company badges with past question hints
│   │   ├── ResumeUploader.tsx  # Drag & drop PDF parser
│   │   ├── LiveCaptions.tsx    # Real-time transcribed text display
│   │   └── MetricCard.tsx      # Clean data display card
│   ├── hooks/
│   │   ├── useAudioRecorder.ts # Browser MediaRecorder hook
│   │   └── useVoiceSession.ts  # State machine for the interview lifecycle
│   └── lib/
│       ├── gnani.ts            # Gnani API client utilities
│       ├── gemini.ts           # Gemini prompt wrappers
│       └── utils.ts