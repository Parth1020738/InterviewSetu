# Project Memory & Execution Tracker

## 1. Project Identity
- **Name:** InterviewSetu
- **Core Mission:** Multilingual AI Voice Interviewer Grounded in Resume & Target Company.
- **Repository:** https://github.com/Parth1020738/InterviewSetu
- **Contest:** Gnani AI Great Indian AI Internship Challenge 2026.
- **Deadline:** November 10, 2026.

## 2. Completed Milestones
- [x] Defined core project direction and cut non-essential scope.
- [x] Selected project name: **InterviewSetu**.
- [x] Formulated PRD, Architecture, Rules, Phases, and Design specifications.
- [x] Confirmed Gnani API endpoints (`Prisma` STT & `Timbre` TTS) with live verified curl calls.
- [x] Initialized Git repository and connected remote origin (`Parth1020738/InterviewSetu`).
- [x] Completed Phase 1 (Speech Engine & API routes):
  - `src/lib/gnani.ts` wrapping `synthesizeSpeech` (Timbre v2.5) and `transcribeAudio` (Prisma v3/v2.5 with `indic-auto`).
  - `/api/tts` (handles streaming audio generation for interview questions).
  - `/api/stt` (handles audio upload transcription).
- [x] Completed Phase 2 (Resume & Blueprint Engine):
  - `src/lib/gemini.ts` generating 3-question adaptive interview paths.
  - `/api/blueprint` (handles PDF parsing via `pdf-parse` and LLM blueprint generation).
  - Onboarding page (`src/app/page.tsx`) following dark Linear/Raycast studio design with live audio preview.

## 3. Current Sprint Focus
- Phase 3: The Live Interview Room (`/interview`) with audio visualizer, `useAudioRecorder`, and real-time voice feedback loop.

## 4. Key API Learnings
- Gnani Timbre TTS uses `model: "timbre-v2.5"`, `voice: "Nalini" | "Bhavna" | "Deepak"`, `language: "hi" | "en" | ...`.
- Gnani Prisma STT uses `audio_file: Blob/File`, `language_code: "indic-auto" | "hi-IN" | "en-IN"`. When `indic-auto`, provide `multi_lang_codes: "hi-IN,en-IN"` to obtain simultaneous Hindi & Romanized Hinglish transcripts.
