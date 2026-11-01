---

### `rules.md`

```markdown
# Engineering & Development Rules

## 1. What We MUST Do
- **Keep API Keys Server-Side:** NEVER expose `GNANI_API_KEY` or `GEMINI_API_KEY` in client components or Git commits. Always proxy through Next.js Route Handlers (`/src/app/api/*`).
- **Implement Audio Fallbacks:**
  - If microphone permissions are denied, provide a toggle to type responses so the judges can always test the app even if their browser mic blocks permissions.
  - If a regional voice model fails or times out, fallback to English Timbre or browser Web Speech API with an unobtrusive toast notification.
- **Graceful Error Handling:**
  - Display explicit states: `[Connecting]`, `[Interviewer is speaking...]`, `[Listening to you...]`, `[Analyzing response...]`.
  - Handle rate limits (HTTP 429) from Gnani or Gemini with user-friendly retry banners.
- **Enforce Strict JSON Outputs:** All LLM prompts must return JSON schemas (`responseSchema`) so client rendering never breaks on stray markdown text.

## 2. What We MUST Avoid
- **DO NOT Rebuild Generic Portals:** No long blog sections, project roadmaps, or complex job boards. Keep the entire app focused on the voice interview.
- **DO NOT Over-Animate:** Avoid heavy 3D canvas libraries (Three.js) that slow down mobile screens. Use clean SVG/CSS waveforms.
- **DO NOT Fake Data:** Do not fake API responses or use pre-recorded MP3s for the demo. The live Gnani integration is what wins the internship challenge.
- **Avoid Heavy Libraries:** Do not install massive external audio processing libraries if native browser `MediaRecorder` and `AudioContext` can do the job.