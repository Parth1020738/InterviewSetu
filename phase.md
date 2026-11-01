# Execution Phases & Timeline (Target: Nov 10, 2026)

## Phase 1: API Spike & Audio Core (Nov 2 – Nov 3)
- [ ] Test Gnani Prisma STT endpoint with a sample WAV file in Postman/curl.
- [ ] Test Gnani Timbre TTS endpoint (`https://api.vachana.ai/api/v1/tts/inference`) with Hindi & Hinglish text.
- [ ] Build `/api/stt` and `/api/tts` Next.js route handlers.
- [ ] Implement `useAudioRecorder.ts` hook to record microphone audio and send as `FormData`.

## Phase 2: Resume & Blueprint Engine (Nov 4 – Nov 5)
- [ ] Build Resume PDF text extraction (using `pdf-parse` or client canvas).
- [ ] Implement Gemini prompt combining: `[Resume Text] + [Target Company] + [Selected Language]`.
- [ ] Generate 3-question interview path in strict JSON format.

## Phase 3: The Live Interview Room (Nov 6 – Nov 7)
- [ ] Build `/interview` full-screen page.
- [ ] Connect the Voice Loop: Timbre plays question -> Candidate answers -> Prisma transcribes -> Gemini scores.
- [ ] Build audio visualizer (pulsing waves for interviewer vs. candidate).
- [ ] Test code-mixed answers (e.g., Hinglish speech transcription).

## Phase 4: Scorecard, Polishing & Deploy (Nov 8 – Nov 9)
- [ ] Build `/report` performance scorecard with radar chart or clean breakdown metrics.
- [ ] Test edge cases (no audio, rapid clicking, mobile Safari/Chrome mic permissions).
- [ ] Deploy live build to Vercel.
- [ ] Prepare mock resume & sample answers for the demo video.

## Phase 5: Demo Video & Submission (Nov 10)
- [ ] Record a 60-second video demo (10s setup, 35s live Hinglish voice interview, 15s instant scorecard).
- [ ] Post on LinkedIn & X tagging `@GnaniAI` with `#GnaniAI` and `#GreatIndianAIInternshipChallenge`.
- [ ] Submit official Google Form before deadline.