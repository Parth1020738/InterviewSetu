# Execution Phases & Timeline (Target: Nov 10, 2026)

## Phase 1: API Spike & Audio Core (Nov 2 – Nov 3) [COMPLETED]
- [x] Test Gnani Prisma STT endpoint with live WAV file & Hinglish audio (`indic-auto`, `hi-IN`).
- [x] Test Gnani Timbre TTS endpoint (`https://api.vachana.ai/api/v1/tts/inference`) with Hindi, Hinglish & English text.
- [x] Build `/api/stt` and `/api/tts` Next.js route handlers with server-side API key protection.
- [x] Implement `src/lib/gnani.ts` wrapping `synthesizeSpeech` and `transcribeAudio`.

## Phase 2: Resume & Blueprint Engine (Nov 4 – Nov 5) [COMPLETED]
- [x] Build Resume PDF text extraction (using `pdf-parse` with fallback pasting & sample resume).
- [x] Implement Gemini prompt engine combining: `[Resume Text] + [Target Company] + [Selected Language]`.
- [x] Generate 3-question adaptive interview path in strict JSON format (`/api/blueprint`).
- [x] Build Onboarding Screen (`src/app/page.tsx`) with dark-mode Linear/Raycast studio aesthetic, company badges, and audio preview.

## Phase 3: The Live Interview Room (Nov 6 – Nov 7) [COMPLETED]
- [x] Implement `useAudioRecorder.ts` hook with Web Audio analyser, live 0-100 volume level, and browser PCM WAV conversion.
- [x] Build `AudioWaveform.tsx` with 3 dynamic visual states: Electric Cobalt (#3B82F6) AI speaking wave, Dynamic Emerald (#10B981) reactive mic bars, and Amber (#F59E0B) evaluation pulse.
- [x] Build `/api/evaluate` route handler with Gemini 1.5/3.5 scoring technical, communication, and resume defense metrics.
- [x] Build `/interview` full-screen page orchestrating the end-to-end voice loop (TTS -> candidate mic -> STT -> evaluation -> spoken feedback).
- [x] Added fallback text input modal for mic-permission-denied scenarios.
- [x] Implemented `/report` performance scorecard & defense breakdown.

## Phase 4: Scorecard, Polishing & Deploy (Nov 8 – Nov 9)
- [x] Build `/report` performance scorecard with breakdown metrics.
- [ ] Test edge cases (no audio, rapid clicking, mobile Safari/Chrome mic permissions).
- [ ] Deploy live build to Vercel.
- [ ] Prepare mock resume & sample answers for the demo video.

## Phase 5: Demo Video & Submission (Nov 10)
- [ ] Record a 60-second video demo (10s setup, 35s live Hinglish voice interview, 15s instant scorecard).
- [ ] Post on LinkedIn & X tagging `@GnaniAI` with `#GnaniAI` and `#GreatIndianAIInternshipChallenge`.
- [ ] Submit official Google Form before deadline.
