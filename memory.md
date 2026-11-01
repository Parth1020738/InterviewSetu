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
- [x] Completed Phase 3 (The Live Voice Studio & Evaluation Loop):
  - `src/hooks/useAudioRecorder.ts`: Browser mic capture, live 0-100 volume analyser, PCM WAV converter.
  - `src/components/AudioWaveform.tsx`: 3 dynamic visual states (Cobalt #3B82F6 AI wave, Emerald #10B981 candidate voice reaction, Amber #F59E0B analysis pulse).
  - `/api/evaluate`: Evaluates answer across Technical, Communication, and Resume Defense metrics.
  - `src/app/interview/page.tsx`: Full spoken loop from TTS playback to auto-mic capture, live Hinglish dual-captions, spoken feedback, and fallback text modal.
  - `src/app/report/page.tsx`: Comprehensive scorecard & defense analytics.

## 3. Current Sprint Focus
- Phase 4: Final polishing, mobile/browser edge-case testing, and live Vercel deployment.

## 4. Key Engineering Insights
- Gnani Timbre TTS uses `model: "timbre-v2.5"`, `voice: "Nalini" | "Bhavna"`, `language: "hi" | "en" | ...`.
- Gnani Prisma STT operates best with Linear PCM WAV audio chunks and `multi_lang_codes: "hi-IN,en-IN"` for Hinglish dual-transcription.
- Browser `AudioBuffer` conversion to 16-bit PCM WAV in `useAudioRecorder` ensures 100% format compatibility with Gnani's backend.
