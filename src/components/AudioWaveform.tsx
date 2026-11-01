"use client";

import React, { useEffect, useRef } from "react";

export type WaveformMode = "idle" | "ai-speaking" | "candidate-speaking" | "processing";

interface AudioWaveformProps {
  mode: WaveformMode;
  volumeLevel?: number; // 0 to 100 (for candidate-speaking)
  className?: string;
  statusLabel?: string;
}

export function AudioWaveform({
  mode,
  volumeLevel = 0,
  className = "",
  statusLabel,
}: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const centerY = height / 2;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      phaseRef.current += 0.05;

      const numBars = 32;
      const barWidth = 4;
      const gap = (width - numBars * barWidth) / (numBars - 1);

      if (mode === "ai-speaking") {
        // AI Speaking: Electric Cobalt (#3B82F6) wave animation
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, "rgba(59, 130, 246, 0.4)");
        gradient.addColorStop(0.5, "rgba(96, 165, 250, 1)");
        gradient.addColorStop(1, "rgba(59, 130, 246, 0.4)");

        for (let i = 0; i < numBars; i++) {
          const x = i * (barWidth + gap);
          // Combine 2 sine waves with phase for an organic breathing fluid effect
          const wave =
            Math.sin(phaseRef.current * 1.5 + i * 0.25) *
            Math.cos(phaseRef.current * 0.8 + i * 0.15);
          const barHeight = Math.max(6, Math.abs(wave) * (height * 0.75));

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, centerY - barHeight / 2, barWidth, barHeight, 2);
          ctx.fill();
        }
      } else if (mode === "candidate-speaking") {
        // Candidate Speaking: Dynamic Emerald (#10B981) reactive bars driven by live volume
        const normalizedVol = Math.max(0.12, Math.min(1, volumeLevel / 65));
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, "rgba(16, 185, 129, 0.6)");
        gradient.addColorStop(0.5, "rgba(52, 211, 153, 1)");
        gradient.addColorStop(1, "rgba(16, 185, 129, 0.6)");

        for (let i = 0; i < numBars; i++) {
          const x = i * (barWidth + gap);
          // Bell curve multiplier so middle bars react higher
          const distanceFromCenter = Math.abs(i - numBars / 2) / (numBars / 2);
          const centerWeight = Math.cos(distanceFromCenter * (Math.PI / 2.2));
          const jitter = Math.sin(phaseRef.current * 3 + i * 0.4) * 0.15;
          const barHeight = Math.max(
            5,
            normalizedVol * height * 0.85 * centerWeight + jitter * 12
          );

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, centerY - barHeight / 2, barWidth, barHeight, 2);
          ctx.fill();
        }
      } else if (mode === "processing") {
        // Processing / Evaluating: Amber (#F59E0B) subtle pulse
        const pulse = (Math.sin(phaseRef.current * 2) + 1) / 2; // 0 to 1
        ctx.fillStyle = `rgba(245, 158, 11, ${0.35 + pulse * 0.55})`;

        for (let i = 0; i < numBars; i++) {
          const x = i * (barWidth + gap);
          const offset = Math.abs(Math.sin(phaseRef.current * 1.2 + i * 0.2));
          const barHeight = 8 + offset * 18 * pulse;

          ctx.beginPath();
          ctx.roundRect(x, centerY - barHeight / 2, barWidth, barHeight, 2);
          ctx.fill();
        }
      } else {
        // Idle: Minimal muted resting bars
        ctx.fillStyle = "rgba(148, 163, 184, 0.25)";
        for (let i = 0; i < numBars; i++) {
          const x = i * (barWidth + gap);
          const barHeight = 4;
          ctx.beginPath();
          ctx.roundRect(x, centerY - barHeight / 2, barWidth, barHeight, 2);
          ctx.fill();
        }
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mode, volumeLevel]);

  const getStateBadge = () => {
    switch (mode) {
      case "ai-speaking":
        return {
          color: "border-[#3B82F6]/40 text-[#60A5FA] bg-[#3B82F6]/10",
          dot: "bg-[#3B82F6] animate-ping",
          text: statusLabel || "Gnani Timbre is speaking...",
        };
      case "candidate-speaking":
        return {
          color: "border-[#10B981]/40 text-[#34D399] bg-[#10B981]/10",
          dot: "bg-[#10B981] animate-pulse",
          text: statusLabel || "Listening to your response...",
        };
      case "processing":
        return {
          color: "border-[#F59E0B]/40 text-[#FBBF24] bg-[#F59E0B]/10",
          dot: "bg-[#F59E0B] animate-spin",
          text: statusLabel || "Analyzing & scoring answer...",
        };
      default:
        return {
          color: "border-[#232B3E] text-[#94A3B8] bg-[#121620]",
          dot: "bg-[#94A3B8]",
          text: statusLabel || "Voice channel standby",
        };
    }
  };

  const badge = getStateBadge();

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      {/* State Pill */}
      <div
        className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-xs font-mono transition-all duration-300 ${badge.color}`}
      >
        <span className={`w-2 h-2 rounded-full ${badge.dot}`}></span>
        <span>{badge.text}</span>
      </div>

      {/* Canvas Waveform */}
      <div className="w-full h-24 max-w-md relative flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
}
