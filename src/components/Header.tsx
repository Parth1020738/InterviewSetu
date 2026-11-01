import React from "react";
import { Mic, Activity, ShieldCheck } from "lucide-react";

export function Header() {
  return (
    <header className="w-full border-b border-[#232B3E] bg-[#0A0D14]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo / Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B]">
            <Mic className="w-4 h-4" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="font-semibold text-lg tracking-tight text-[#F8FAFC]">
              Interview<span className="text-[#F59E0B]">Setu</span>
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#94A3B8] px-1.5 py-0.5 rounded bg-[#121620] border border-[#232B3E]">
              Voice Terminal
            </span>
          </div>
        </div>

        {/* Engine Status Indicators */}
        <div className="hidden sm:flex items-center space-x-3 text-xs font-mono">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#121620] border border-[#232B3E] text-[#94A3B8]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Gnani Prisma & Timbre</span>
          </div>
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#121620] border border-[#232B3E] text-[#94A3B8]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Gemini 1.5 Flash</span>
          </div>
        </div>
      </div>
    </header>
  );
}

