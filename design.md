# Visual Design System & UI Specifications

> **Core Philosophy:** Avoid the generic "white-card-with-purple-gradient" look. InterviewSetu must look like a high-end, distraction-free corporate assessment terminal engineered by a design-led studio (similar to Linear, Raycast, or Retool).

## 1. Color Palette (Dark-Mode First Studio Feel)
- **Background Deep:** `#0A0D14` (Neutral pitch black with subtle blue-gray tint)
- **Surface Elevation 1:** `#121620` (Card and modal background)
- **Surface Elevation 2:** `#1A202C` (Input fields, hover states)
- **Border Subtle:** `#232B3E` (1px clean outlines, no drop shadows)
- **Brand Accent (Indic Gold/Saffron Modernized):** `#F59E0B` (Used sparingly for active states, CTA buttons, and high scores)
- **Voice Active Glow:** `#10B981` (Emerald pulse when candidate is speaking)
- **AI Speaking Glow:** `#3B82F6` (Electric cobalt wave when Timbre is speaking)
- **Text Primary:** `#F8FAFC` (High contrast crisp white)
- **Text Muted:** `#94A3B8` (Secondary explanations, subtitles)

## 2. Typography
- **Primary Sans:** `Plus Jakarta Sans` or `Geist Sans` (Clean, geometric, highly legible technical font).
- **Monospace:** `JetBrains Mono` (Used for technical keywords, transcript timestamps, latency indicators).

## 3. UI Components & Layout Rules
- **Interview Studio View:**
  - Centered focus: Minimalist circular soundwave visualizer in the center.
  - No clutter: Only the current question, a live transcript caption bar at the bottom, and a prominent mic toggle button.
  - Subtle status pill at the top: `● Gnani Prisma Connected | Latency: 1.2s`.
- **Card Styling:**
  - Flat cards with thin `border border-[#232B3E]`.
  - Rounded corners: `rounded-xl` (12px), avoiding oversized bubbly borders.