"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import {
  Award,
  CheckCircle2,
  TrendingUp,
  RotateCcw,
  Share2,
  Download,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ReportPayload {
  session: {
    blueprint: {
      candidateName: string;
      extractedSkills: string[];
      extractedProjects: string[];
      companyFocus: string;
      language: string;
    };
    company: string;
    role: string;
    language: string;
    startedAt: string;
  };
  evaluations: {
    question: string;
    answer: string;
    transcripts?: Record<string, string>;
    score: {
      technical: number;
      communication: number;
      resumeDefense: number;
    };
    verbalFeedback: string;
    keyStrengths: string[];
    areasToImprove: string[];
  }[];
  completedAt: string;
}

export default function ReportPage() {
  const router = useRouter();
  const [report, setReport] = useState<ReportPayload | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = localStorage.getItem("interviewsetu_report");
    if (raw) {
      try {
        const parsed: ReportPayload = JSON.parse(raw);
        setReport(parsed);
      } catch (err) {
        console.error("Failed to parse report data:", err);
      }
    } else {
      // Sample mock report if visited directly
      setReport({
        session: {
          blueprint: {
            candidateName: "Parth Patel",
            extractedSkills: ["React", "Node.js", "Redis", "PostgreSQL"],
            extractedProjects: ["Real-time WebSocket Chat Microservice"],
            companyFocus: "Swiggy",
            language: "Hinglish",
          },
          company: "Swiggy",
          role: "Fullstack Engineer",
          language: "Hinglish",
          startedAt: new Date(Date.now() - 600000).toISOString(),
        },
        evaluations: [
          {
            question:
              "Aapne resume me likha hai ki aapne Redis use kiya tha chat service me. Can you explain cache invalidation and connection heartbeat kaise handle kiya?",
            answer:
              "Humne Redis pub-sub architecture implement kiya tha jisme heartbeat har 30 seconds me ping hoti thi aur TTL se stale sessions invalidate ho jaate the.",
            score: {
              technical: 88,
              communication: 90,
              resumeDefense: 92,
            },
            verbalFeedback:
              "Shaandar explanation! Aapne TTL and pub-sub mechanism accurately explain kiya.",
            keyStrengths: [
              "Clear understanding of distributed pub/sub",
              "Concrete mention of 30-second TTL invalidation",
            ],
            areasToImprove: [
              "Could also touch upon split-brain scenarios or cluster failover",
            ],
          },
        ],
        completedAt: new Date().toISOString(),
      });
    }
  }, []);

  const handleRetake = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("interviewsetu_session");
      localStorage.removeItem("interviewsetu_report");
    }
    router.push("/");
  };

  const handleShare = () => {
    if (!report) return;
    const count = report.evaluations.length || 1;
    const avgTech = Math.round(
      report.evaluations.reduce((acc, curr) => acc + curr.score.technical, 0) / count
    );
    const avgDefense = Math.round(
      report.evaluations.reduce((acc, curr) => acc + curr.score.resumeDefense, 0) / count
    );
    const overall = Math.round(avgTech * 0.5 + avgDefense * 0.5);

    const shareText = `🎯 InterviewSetu Performance Scorecard
Candidate: ${report.session.blueprint?.candidateName || "Candidate"}
Company: ${report.session.company} (${report.session.role})
Overall Readiness Score: ${overall}/100
Technical Depth: ${avgTech}/100 | Resume Defense: ${avgDefense}/100
Powered by Gnani AI (Prisma STT + Timbre TTS) & Gemini`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (!report) {
    return (
      <div className="min-h-screen bg-[#0A0D14] flex flex-col items-center justify-center text-[#94A3B8] font-mono">
        <p>Loading assessment scorecard...</p>
      </div>
    );
  }

  // Calculate Average Scores
  const count = report.evaluations.length || 1;
  const avgTech = Math.round(
    report.evaluations.reduce((acc, curr) => acc + curr.score.technical, 0) / count
  );
  const avgComm = Math.round(
    report.evaluations.reduce((acc, curr) => acc + curr.score.communication, 0) / count
  );
  const avgDefense = Math.round(
    report.evaluations.reduce((acc, curr) => acc + curr.score.resumeDefense, 0) / count
  );
  const overallScore = Math.round(avgTech * 0.4 + avgDefense * 0.35 + avgComm * 0.25);

  return (
    <div className="min-h-screen bg-[#0A0D14] flex flex-col print:bg-white print:text-black">
      <div className="print:hidden">
        <Header />
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-8">
        {/* Top Header & Action Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#232B3E] pb-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-md bg-[#10B981]/10 border border-[#10B981]/30 text-xs font-mono text-[#10B981] mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Assessment Completed & Verified</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#F8FAFC] print:text-black">
              Performance Scorecard & Defense Report
            </h1>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-1 font-mono print:text-gray-700">
              Candidate: <span className="text-[#F8FAFC] print:text-black font-semibold">{report.session.blueprint?.candidateName || "Candidate"}</span> • Target: <span className="text-[#F59E0B] font-semibold">{report.session.company}</span> ({report.session.role})
            </p>
          </div>

          {/* Action Button Row */}
          <div className="flex items-center space-x-2.5 flex-wrap print:hidden">
            <button
              type="button"
              onClick={handleShare}
              className="px-3.5 py-2 rounded-xl bg-[#121620] hover:bg-[#1A202C] border border-[#232B3E] text-xs font-mono text-[#F8FAFC] flex items-center space-x-1.5 transition-colors"
              title="Copy scorecard summary to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#10B981]" />
                  <span className="text-[#10B981]">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-[#3B82F6]" />
                  <span>Share Card</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-[#121620] hover:bg-[#1A202C] border border-[#232B3E] text-xs font-mono text-[#F8FAFC] flex items-center space-x-1.5 transition-colors"
              title="Print or Save PDF report"
            >
              <Download className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Download PDF</span>
            </button>

            <button
              type="button"
              onClick={handleRetake}
              className="px-3.5 py-2 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#0A0D14] font-semibold text-xs font-mono flex items-center space-x-1.5 transition-all shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Interview</span>
            </button>
          </div>
        </div>

        {/* Overall Score Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {/* Main Readiness Card */}
          <div className="sm:col-span-1 p-6 rounded-2xl bg-[#121620] border border-[#F59E0B]/50 flex flex-col items-center justify-center text-center shadow-[0_0_30px_rgba(245,158,11,0.08)] print:border-gray-300 print:bg-gray-50">
            <Award className="w-7 h-7 text-[#F59E0B] mb-1" />
            <span className="text-4xl font-extrabold text-[#F8FAFC] print:text-black font-mono tracking-tight mt-1">
              {overallScore}
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#F59E0B] mt-1 font-semibold">
              Readiness Score
            </span>
            <span className="text-[10px] text-[#94A3B8] print:text-gray-600 mt-1">
              {overallScore >= 80 ? "High Hire Potential" : "Needs Practice"}
            </span>
          </div>

          {/* Breakdown Metric Cards */}
          <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-[#121620] border border-[#232B3E] flex flex-col justify-between print:border-gray-300 print:bg-gray-50">
              <span className="text-xs font-mono text-[#94A3B8] print:text-gray-700">Technical Depth</span>
              <div className="flex items-baseline space-x-2 my-2">
                <span className="text-2xl font-bold font-mono text-[#F8FAFC] print:text-black">{avgTech}</span>
                <span className="text-xs text-[#94A3B8] print:text-gray-600">/ 100</span>
              </div>
              <div className="w-full bg-[#1A202C] h-1.5 rounded-full overflow-hidden print:bg-gray-200">
                <div
                  className="bg-[#3B82F6] h-full rounded-full"
                  style={{ width: `${avgTech}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#121620] border border-[#232B3E] flex flex-col justify-between print:border-gray-300 print:bg-gray-50">
              <span className="text-xs font-mono text-[#94A3B8] print:text-gray-700">Resume Defense</span>
              <div className="flex items-baseline space-x-2 my-2">
                <span className="text-2xl font-bold font-mono text-[#F8FAFC] print:text-black">{avgDefense}</span>
                <span className="text-xs text-[#94A3B8] print:text-gray-600">/ 100</span>
              </div>
              <div className="w-full bg-[#1A202C] h-1.5 rounded-full overflow-hidden print:bg-gray-200">
                <div
                  className="bg-[#10B981] h-full rounded-full"
                  style={{ width: `${avgDefense}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#121620] border border-[#232B3E] flex flex-col justify-between print:border-gray-300 print:bg-gray-50">
              <span className="text-xs font-mono text-[#94A3B8] print:text-gray-700">Communication (Indic)</span>
              <div className="flex items-baseline space-x-2 my-2">
                <span className="text-2xl font-bold font-mono text-[#F8FAFC] print:text-black">{avgComm}</span>
                <span className="text-xs text-[#94A3B8] print:text-gray-600">/ 100</span>
              </div>
              <div className="w-full bg-[#1A202C] h-1.5 rounded-full overflow-hidden print:bg-gray-200">
                <div
                  className="bg-[#F59E0B] h-full rounded-full"
                  style={{ width: `${avgComm}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Question Evaluations */}
        <div className="space-y-4">
          <h2 className="text-sm font-mono uppercase tracking-wider text-[#94A3B8] print:text-gray-700">
            Detailed Question Breakdown & Spoken Defense
          </h2>

          <div className="space-y-3">
            {report.evaluations.map((item, idx) => {
              const isExpanded = expandedIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl bg-[#121620] border border-[#232B3E] overflow-hidden transition-all print:border-gray-300 print:bg-white"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-[#151a26] print:hover:bg-white"
                  >
                    <div className="space-y-1">
                      <span className="text-xs font-mono text-[#F59E0B] font-semibold">
                        Question {idx + 1}
                      </span>
                      <p className="text-sm text-[#F8FAFC] print:text-black font-medium line-clamp-1">
                        {item.question}
                      </p>
                    </div>

                    <div className="flex items-center space-x-4 flex-shrink-0">
                      <span className="text-xs font-mono text-[#10B981] px-2 py-0.5 rounded bg-[#10B981]/10 border border-[#10B981]/30">
                        Avg: {Math.round((item.score.technical + item.score.resumeDefense) / 2)}/100
                      </span>
                      <span className="print:hidden">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-[#94A3B8]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#94A3B8]" />
                        )}
                      </span>
                    </div>
                  </button>

                  {(isExpanded || typeof window !== "undefined") && (
                    <div className="p-4 pt-0 border-t border-[#232B3E] print:border-gray-200 space-y-4 text-xs font-mono mt-3">
                      {/* Spoken Answer Transcript */}
                      <div>
                        <span className="text-[#94A3B8] print:text-gray-600 uppercase tracking-wider block mb-1">
                          Spoken Answer (Transcribed via Gnani Prisma):
                        </span>
                        <div className="p-3 rounded-lg bg-[#0A0D14] print:bg-gray-50 border border-[#232B3E] print:border-gray-200 text-[#F8FAFC] print:text-black">
                          &ldquo;{item.answer}&rdquo;
                        </div>
                      </div>

                      {/* Verbal Feedback */}
                      <div>
                        <span className="text-[#94A3B8] print:text-gray-600 uppercase tracking-wider block mb-1">
                          Interviewer Verbal Feedback (Timbre Spoken):
                        </span>
                        <p className="text-[#3B82F6] print:text-blue-800 bg-[#3B82F6]/5 print:bg-blue-50 p-2.5 rounded-lg border border-[#3B82F6]/20 print:border-blue-200">
                          {item.verbalFeedback}
                        </p>
                      </div>

                      {/* Strengths & Improvements */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="p-3 rounded-lg bg-[#0A0D14] print:bg-gray-50 border border-[#232B3E] print:border-gray-200 space-y-1">
                          <span className="text-[#10B981] print:text-green-800 font-semibold flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Key Strengths:</span>
                          </span>
                          <ul className="list-disc list-inside text-[#94A3B8] print:text-gray-700 space-y-1">
                            {item.keyStrengths?.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-3 rounded-lg bg-[#0A0D14] print:bg-gray-50 border border-[#232B3E] print:border-gray-200 space-y-1">
                          <span className="text-[#F59E0B] print:text-amber-800 font-semibold flex items-center space-x-1">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>Areas to Hone:</span>
                          </span>
                          <ul className="list-disc list-inside text-[#94A3B8] print:text-gray-700 space-y-1">
                            {item.areasToImprove?.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
