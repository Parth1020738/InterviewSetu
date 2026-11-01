"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { ResumeUploader } from "@/components/ResumeUploader";
import { CompanySelector } from "@/components/CompanySelector";
import { LanguageSelector } from "@/components/LanguageSelector";
import {
  Sparkles,
  ArrowRight,
  Bot,
  Volume2,
  CheckCircle,
  Play,
  RotateCw,
  Cpu,
  Radio,
  FileCheck,
} from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();

  // Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customText, setCustomText] = useState("");
  const [selectedRole, setSelectedRole] = useState(
    "Fullstack Engineer (React + Node)"
  );
  const [selectedCompany, setSelectedCompany] = useState("Swiggy");
  const [selectedLanguage, setSelectedLanguage] = useState("Hinglish");

  // Blueprint & Audio preview state
  const [isGenerating, setIsGenerating] = useState(false);
  const [blueprint, setBlueprint] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);

  const handleGenerateBlueprint = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setErrorMessage(null);
    setBlueprint(null);
    setPreviewAudioUrl(null);

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append("resume", selectedFile);
      }
      formData.append("resumeText", customText);
      formData.append("company", selectedCompany);
      formData.append("role", selectedRole);
      formData.append("language", selectedLanguage);

      const res = await fetch("/api/blueprint", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate interview blueprint.");
      }

      setBlueprint(data.blueprint);
      // Save session info to localStorage for the interview room
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "interviewsetu_session",
          JSON.stringify({
            blueprint: data.blueprint,
            company: selectedCompany,
            role: selectedRole,
            language: selectedLanguage,
            startedAt: new Date().toISOString(),
          })
        );
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTestTTS = async (text: string) => {
    try {
      setIsPlayingAudio(true);
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          language: selectedLanguage,
          voice: selectedLanguage === "Hindi" ? "Bhavna" : "Nalini",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "TTS synthesis failed");
      }

      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      setPreviewAudioUrl(audioUrl);
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => setIsPlayingAudio(false);
      await audio.play();
    } catch (err: any) {
      console.error(err);
      alert(`Gnani Timbre TTS Notice: ${err.message}`);
      setIsPlayingAudio(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] flex flex-col">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 space-y-8">
        {/* Terminal Hero Banner */}
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-[#121620] border border-[#232B3E] text-xs font-mono text-[#F59E0B]">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#10B981]" />
            <span>Gnani AI Great Indian Internship Challenge 2026</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F8FAFC]">
            Context-Grounded Multilingual Voice Interviewer
          </h1>
          <p className="text-sm sm:text-base text-[#94A3B8] max-w-3xl leading-relaxed">
            Practice high-stakes engineering interviews grounded directly in your resume projects and target company questions. Speak freely in{" "}
            <span className="text-[#F8FAFC] font-medium">Hinglish, Hindi, or English</span> powered by{" "}
            <span className="text-[#F59E0B] font-medium">Gnani Prisma STT</span> &amp;{" "}
            <span className="text-[#3B82F6] font-medium">Timbre TTS</span>.
          </p>
        </div>

        {/* Configuration Setup Form */}
        <form onSubmit={handleGenerateBlueprint} className="space-y-6">
          {/* Card: Candidate Setup */}
          <div className="bg-[#121620] border border-[#232B3E] rounded-xl p-5 sm:p-6 space-y-6 shadow-sm">
            {/* Step 1: Resume Upload */}
            <ResumeUploader
              onFileSelect={(file, fallbackText) => {
                setSelectedFile(file);
                if (fallbackText !== undefined) setCustomText(fallbackText);
              }}
              selectedFile={selectedFile}
              customText={customText}
              onCustomTextChange={setCustomText}
            />

            <div className="h-[1px] bg-[#232B3E]" />

            {/* Step 2 & 3: Role and Company Selector */}
            <CompanySelector
              selectedCompany={selectedCompany}
              onSelectCompany={setSelectedCompany}
              selectedRole={selectedRole}
              onSelectRole={setSelectedRole}
            />

            <div className="h-[1px] bg-[#232B3E]" />

            {/* Step 4: Spoken Language Selector */}
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              onSelectLanguage={setSelectedLanguage}
            />
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs font-mono">
              <strong>Error:</strong> {errorMessage}
            </div>
          )}

          {/* Submit Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-xs text-[#94A3B8] font-mono flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-[#F59E0B]" />
              <span>
                Gemini 1.5 Flash extracts actual claims &amp; generates 3-stage adaptive interview path
              </span>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#0A0D14] font-semibold text-sm flex items-center justify-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(245,158,11,0.25)]"
            >
              {isGenerating ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-[#0A0D14]" />
                  <span>Synthesizing Interview Blueprint...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#0A0D14]" />
                  <span>Generate Blueprint &amp; Preview Questions</span>
                  <ArrowRight className="w-4 h-4 text-[#0A0D14]" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Blueprint Preview & Launch Panel */}
        {blueprint && (
          <div className="bg-[#121620] border border-[#F59E0B]/40 rounded-xl p-6 space-y-6 shadow-[0_0_30px_rgba(245,158,11,0.06)] animate-in fade-in-50 duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#232B3E] pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <FileCheck className="w-5 h-5 text-[#10B981]" />
                  <h2 className="text-lg font-semibold text-[#F8FAFC]">
                    Target Blueprint Ready: {blueprint.candidateName || "Candidate"}
                  </h2>
                </div>
                <p className="text-xs text-[#94A3B8] mt-0.5 font-mono">
                  Company Focus: <span className="text-[#F59E0B]">{selectedCompany}</span> | Language:{" "}
                  <span className="text-[#3B82F6]">{blueprint.language}</span>
                </p>
              </div>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-1.5">
                {blueprint.extractedSkills?.slice(0, 5).map((skill: string, i: number) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1A202C] text-[#F8FAFC] border border-[#232B3E]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Questions Sequence Preview */}
            <div className="space-y-3">
              <p className="text-xs font-mono uppercase tracking-wider text-[#94A3B8]">
                Tailored 3-Stage Question Path
              </p>
              <div className="space-y-3">
                {blueprint.questions?.map((q: any) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-xl bg-[#0A0D14] border border-[#232B3E] space-y-2 hover:border-[#334155] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-semibold text-[#F59E0B]">
                        Q{q.id}. {q.type.replace(/_/g, " ").toUpperCase()}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleTestTTS(q.question)}
                        disabled={isPlayingAudio}
                        className="text-[11px] font-mono flex items-center space-x-1.5 px-2 py-1 rounded bg-[#121620] border border-[#232B3E] text-[#94A3B8] hover:text-[#3B82F6] hover:border-[#3B82F6]/50 transition-colors"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{isPlayingAudio ? "Speaking..." : "Listen with Gnani Timbre"}</span>
                      </button>
                    </div>

                    <p className="text-sm text-[#F8FAFC] font-medium leading-relaxed">
                      &ldquo;{q.question}&rdquo;
                    </p>

                    <div className="flex items-center justify-between text-[11px] font-mono text-[#94A3B8] pt-1">
                      <span>Evaluation Intent: {q.intent}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Step CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-[#232B3E]">
              <div className="text-xs font-mono text-[#94A3B8] flex items-center space-x-1.5">
                <CheckCircle className="w-4 h-4 text-[#10B981]" />
                <span>Microphone permission will be requested upon entering studio</span>
              </div>

              <button
                type="button"
                onClick={() => router.push("/interview")}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#0A0D14] font-semibold text-sm flex items-center justify-center space-x-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.25)]"
              >
                <span>Launch Live Voice Studio</span>
                <ArrowRight className="w-4 h-4 text-[#0A0D14]" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

