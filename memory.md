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
- [x] Confirmed Gnani API endpoints (`Prisma` STT & `Timbre` TTS).
- [x] Initialized Git repository and connected remote origin (`Parth1020738/InterviewSetu`).

## 3. Current Sprint Focus
- Phase 1: Test Gnani API keys and set up the Next.js API routes (`/api/stt` and `/api/tts`).

## 4. Known Blockers / Risks
- Confirm whether Prisma API key permissions support streaming WebSocket or REST batch transcription for client audio files.
- Ensure audio format recorded by browser (`audio/webm`) is transcoded or sent as PCM/WAV to meet Gnani's expected sample rate (16kHz / 48kHz).
