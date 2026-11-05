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
  Volume2,
  CheckCircle,
  RotateCw,
  Cpu,
  Radio,
  FileCheck,
  Zap,
  Briefcase,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();

  // Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customText, setCustomText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [showJdInput, setShowJdInput] = useState(false);
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

  const sampleResumeText = `Parth Patel
Software Engineering Graduate & Full-Stack Developer
Email: parth@example.com | Portfolio: parthdev.io

EXPERIENCE & PROJECTS:
1. Real-Time Chat & Notification Microservice (Node.js, Redis, WebSockets, PostgreSQL)
   - Architected pub/sub communication handling 5,000+ concurrent connections with <40ms message latency.
   - Implemented distributed cache invalidation and connection heartbeat monitoring in Redis.
2. Indic Voice AI Assistant (Next.js, Web Speech, Tailwind CSS)
   - Built an interactive voice frontend with Web Audio API for audio visualization and low-latency playback.
   - Integrated custom REST endpoints for speech-to-text transcription and fallback synthesis.

SKILLS:
- Languages & Frameworks: TypeScript, JavaScript, Python, React, Next.js, Node.js, Express.
- Databases & Infrastructure: PostgreSQL, Redis, Docker, REST APIs, Git.`;

  const sampleJdText = `Role: Senior Fullstack Engineer at Swiggy
Key Responsibilities:
- Build high-throughput, low-latency microservices for live hyperlocal order dispatch.
- Design resilient pub/sub event streams using Kafka or Redis clusters under peak load spikes.
- Manage PostgreSQL replication, sharding, and cache invalidation consistency.
- Handle production fire drills, circuit breakers, and zero-downtime rollouts.`;

  const handleGenerateBlueprint = async (
    e?: React.FormEvent,
    overrideText?: string,
    overrideCompany?: string,
    overrideRole?: string,
    overrideLang?: string,
    overrideJd?: string
  ) => {
    if (e) e.preventDefault();
    setIsGenerating(true);
    setErrorMessage(null);
    setBlueprint(null);
    setPreviewAudioUrl(null);

    const textToUse = overrideText !== undefined ? overrideText : customText;
    const jdToUse = overrideJd !== undefined ? overrideJd : jobDescription;
    const companyToUse = overrideCompany || selectedCompany;
    const roleToUse = overrideRole || selectedRole;
    const langToUse = overrideLang || selectedLanguage;

    try {
      const formData = new FormData();
      if (selectedFile && overrideText === undefined) {
        formData.append("resume", selectedFile);
      }
      formData.append("resumeText", textToUse);
      if (jdToUse) {
        formData.append("jobDescription", jdToUse);
      }
      formData.append("company", companyToUse);
      formData.append("role", roleToUse);
      formData.append("language", langToUse);

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
            company: companyToUse,
            role: roleToUse,
            language: langToUse,
            jobDescription: jdToUse,
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

  const handleQuickDemo = () => {
    setSelectedFile(null);
    setCustomText(sampleResumeText);
    setJobDescription(sampleJdText);
    setShowJdInput(true);
    setSelectedCompany("Swiggy");
    setSelectedRole("Fullstack Engineer (React + Node)");
    setSelectedLanguage("Hinglish");
    handleGenerateBlueprint(
      undefined,
      sampleResumeText,
      "Swiggy",
      "Fullstack Engineer (React + Node)",
      "Hinglish",
      sampleJdText
    );
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
            Practice high-stakes engineering interviews grounded directly in your resume projects and target Job Description. Preview topics on onboarding, then face fresh, dynamic deep dives in{" "}
            <span className="text-[#F8FAFC] font-medium">Hinglish, Hindi, or English</span> powered by{" "}
            <span className="text-[#F59E0B] font-medium">Gnani Prisma STT</span> &amp;{" "}
            <span className="text-[#3B82F6] font-medium">Timbre TTS</span>.
          </p>
        </div>

        {/* Quick Demo CTA Card for Live Judges */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#1A202C] via-[#121620] to-[#1A202C] border border-[#F59E0B]/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-[#F59E0B]/5">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B] flex-shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <p className="text-sm font-semibold text-[#F8FAFC]">
                  Evaluating the Live Demo?
                </p>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30">
                  Instant Setup
                </span>
              </div>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Load a pre-built Fullstack engineer profile (Redis, WebSockets, Node.js) paired with a Swiggy Job Description with one click.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleQuickDemo}
            disabled={isGenerating}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#0A0D14] font-semibold text-xs flex items-center justify-center space-x-2 transition-all shadow-md flex-shrink-0 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Try with Sample Resume &amp; JD</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        {/* Configuration Setup Form */}
        <form onSubmit={(e) => handleGenerateBlueprint(e)} className="space-y-6">
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

            {/* Optional Step 1B: Target Job Description (JD) Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowJdInput(!showJdInput)}
                  className="text-xs font-mono uppercase tracking-wider text-[#94A3B8] hover:text-[#F8FAFC] flex items-center space-x-1.5 transition-colors"
                >
                  <Briefcase className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Optional: Add Target Job Description (JD)</span>
                  {showJdInput ? (
                    <ChevronUp className="w-3.5 h-3.5 text-[#94A3B8]" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
                  )}
                </button>
                {showJdInput && (
                  <button
                    type="button"
                    onClick={() => setJobDescription(sampleJdText)}
                    className="text-xs text-[#F59E0B] hover:text-[#F59E0B]/80 underline font-mono"
                  >
                    Paste Sample Swiggy JD
                  </button>
                )}
              </div>

              {showJdInput && (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the target job description or key technical requirements here (e.g., Must have Kafka, distributed systems, high availability)..."
                    rows={4}
                    className="w-full bg-[#0A0D14] border border-[#232B3E] rounded-xl p-3.5 text-xs font-mono text-[#F8FAFC] placeholder:text-[#94A3B8]/60 focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-all resize-none"
                  />
                  <p className="text-[11px] text-[#94A3B8] font-mono">
                    If provided, questions will be targeted to the exact intersection of your resume and this JD.
                  </p>
                </div>
              )}
            </div>

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
                Gemini generates a screening preview blueprint + fresh dynamic live questions
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
                  {blueprint.jobDescriptionSummary && (
                    <span className="block text-[#94A3B8]/90 mt-1">
                      JD Alignment: {blueprint.jobDescriptionSummary}
                    </span>
                  )}
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="text-xs font-mono uppercase tracking-wider text-[#94A3B8]">
                  Interview Blueprint: 3-Stage Screening Preview
                </p>
                <span className="text-[10px] font-mono text-[#F59E0B] px-2 py-0.5 rounded bg-[#F59E0B]/10 border border-[#F59E0B]/30 self-start sm:self-auto">
                  Live studio will ask fresh, deeper questions (not verbatim preview)
                </span>
              </div>

              <div className="space-y-3">
                {(blueprint.previewQuestions || blueprint.questions)?.map((q: any) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-xl bg-[#0A0D14] border border-[#232B3E] space-y-2 hover:border-[#334155] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-semibold text-[#F59E0B]">
                        Preview Q{q.id}. {q.type.replace(/_/g, " ").toUpperCase()}
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
                <span>Microphone will activate automatically inside the voice studio</span>
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
