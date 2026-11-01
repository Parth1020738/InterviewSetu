"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, FileText, CheckCircle2, X, AlertCircle } from "lucide-react";

interface ResumeUploaderProps {
  onFileSelect: (file: File | null, fallbackText?: string) => void;
  selectedFile: File | null;
  customText: string;
  onCustomTextChange: (text: string) => void;
}

export function ResumeUploader({
  onFileSelect,
  selectedFile,
  customText,
  onCustomTextChange,
}: ResumeUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [mode, setMode] = useState<"file" | "paste">("file");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        onFileSelect(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  const setSampleResume = () => {
    const sample = `Parth Patel
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

    onCustomTextChange(sample);
    onFileSelect(null, sample);
    setMode("paste");
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono uppercase tracking-wider text-[#94A3B8] flex items-center space-x-1.5">
          <span>01. Candidate Profile / Resume</span>
        </label>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setMode("file")}
            className={`text-xs px-2.5 py-1 rounded transition-colors ${
              mode === "file"
                ? "bg-[#1A202C] text-[#F8FAFC] border border-[#232B3E]"
                : "text-[#94A3B8] hover:text-[#F8FAFC]"
            }`}
          >
            Upload PDF
          </button>
          <button
            type="button"
            onClick={() => setMode("paste")}
            className={`text-xs px-2.5 py-1 rounded transition-colors ${
              mode === "paste"
                ? "bg-[#1A202C] text-[#F8FAFC] border border-[#232B3E]"
                : "text-[#94A3B8] hover:text-[#F8FAFC]"
            }`}
          >
            Paste Text
          </button>
          <button
            type="button"
            onClick={setSampleResume}
            className="text-xs text-[#F59E0B] hover:text-[#F59E0B]/80 underline underline-offset-4 font-mono pl-1"
          >
            Use Sample Resume
          </button>
        </div>
      </div>

      {mode === "file" ? (
        <div>
          {!selectedFile ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? "border-[#F59E0B] bg-[#F59E0B]/5"
                  : "border-[#232B3E] bg-[#121620] hover:bg-[#1A202C]/60 hover:border-[#334155]"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#1A202C] border border-[#232B3E] flex items-center justify-center text-[#94A3B8]">
                  <UploadCloud className="w-5 h-5 text-[#94A3B8]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#F8FAFC]">
                    Drop your PDF resume here, or <span className="text-[#F59E0B]">browse</span>
                  </p>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    Supports standard PDF format up to 5MB
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#121620] border border-[#232B3E]">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="w-9 h-9 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center flex-shrink-0 text-[#F59E0B]">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <p className="text-sm font-medium text-[#F8FAFC] truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-[#94A3B8]">
                    {(selectedFile.size / 1024).toFixed(1)} KB • Ready for extraction
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onFileSelect(null)}
                className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1A202C] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-1.5">
          <textarea
            value={customText}
            onChange={(e) => {
              onCustomTextChange(e.target.value);
              onFileSelect(null, e.target.value);
            }}
            placeholder="Paste projects, skills, and work experience here (e.g. Node.js backend with Redis caching and WebSockets)..."
            rows={5}
            className="w-full bg-[#121620] border border-[#232B3E] rounded-xl p-3.5 text-xs font-mono text-[#F8FAFC] placeholder:text-[#94A3B8]/60 focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-all resize-none"
          />
          <p className="text-[11px] text-[#94A3B8] font-mono flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
            <span>Gemini 1.5 Flash will extract technical claims directly from this text.</span>
          </p>
        </div>
      )}
    </div>
  );
}

