"use client";

import React from "react";
import { Languages, Volume2 } from "lucide-react";

interface LanguageOption {
  id: string;
  name: string;
  native: string;
  badge: string;
  description: string;
  voice: string;
}

const LANGUAGES: LanguageOption[] = [
  {
    id: "Hinglish",
    name: "Hinglish",
    native: "हिंग्लिश (Code-mixed)",
    badge: "Recommended for India",
    description: "Speaks and understands mixed Hindi-English technical jargon natively.",
    voice: "Nalini (Timbre v2.5)",
  },
  {
    id: "English",
    name: "English (India)",
    native: "Indian English",
    badge: "Corporate Standard",
    description: "Clear Indian cadence optimized for tech interviews.",
    voice: "Nalini (Timbre v2.5)",
  },
  {
    id: "Hindi",
    name: "Hindi",
    native: "हिन्दी",
    badge: "Indic Native",
    description: "Natural conversational Hindi with technical term retention.",
    voice: "Bhavna (Timbre v2.5)",
  },
  {
    id: "Gujarati",
    name: "Gujarati",
    native: "ગુજરાતી",
    badge: "Regional Indic",
    description: "Gujarati technical interview framing powered by Gnani Prisma.",
    voice: "Nalini (Timbre v2.5)",
  },
  {
    id: "Tamil",
    name: "Tamil",
    native: "தமிழ்",
    badge: "Regional Indic",
    description: "Tamil dialect support for engineering candidates.",
    voice: "Nalini (Timbre v2.5)",
  },
];

interface LanguageSelectorProps {
  selectedLanguage: string;
  onSelectLanguage: (language: string) => void;
}

export function LanguageSelector({
  selectedLanguage,
  onSelectLanguage,
}: LanguageSelectorProps) {
  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono uppercase tracking-wider text-[#94A3B8] flex items-center space-x-1.5">
          <Languages className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span>04. Spoken Interview Language</span>
        </label>
        <span className="text-[11px] font-mono text-[#10B981] flex items-center space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping"></span>
          <span>Gnani Prisma Dual-Speech Decoder Ready</span>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {LANGUAGES.map((lang) => {
          const isSelected = selectedLanguage === lang.id;
          return (
            <button
              key={lang.id}
              type="button"
              onClick={() => onSelectLanguage(lang.id)}
              className={`p-3 rounded-xl text-left transition-all border ${
                isSelected
                  ? "bg-[#1A202C] border-[#F59E0B]/60 shadow-[0_0_15px_rgba(245,158,11,0.08)]"
                  : "bg-[#121620] border-[#232B3E] hover:border-[#334155] hover:bg-[#151a26]"
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-sm font-semibold text-[#F8FAFC]">
                  {lang.name}
                </span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                    isSelected
                      ? "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30"
                      : "bg-[#0A0D14] text-[#94A3B8] border-[#232B3E]"
                  }`}
                >
                  {lang.badge}
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] font-mono">{lang.native}</p>
              <p className="text-[11px] text-[#94A3B8]/80 mt-1 line-clamp-1">
                {lang.description}
              </p>
              <div className="mt-2 text-[10px] font-mono text-[#94A3B8] flex items-center space-x-1">
                <Volume2 className="w-3 h-3 text-[#3B82F6]" />
                <span>Voice: {lang.voice}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

