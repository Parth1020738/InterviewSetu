"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { AudioWaveform, WaveformMode } from "@/components/AudioWaveform";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import {
  Mic,
  Square,
  Keyboard,
  ArrowRight,
  Sparkles,
  Zap,
  Volume2,
  AlertTriangle,
} from "lucide-react";

interface QuestionItem {
  id: number;
  type: string;
  question: string;
  intent: string;
}

interface InterviewSessionData {
  blueprint: {
    candidateName: string;
    extractedSkills: string[];
    extractedProjects: string[];
    companyFocus: string;
    language: string;
    jobDescriptionSummary?: string;
    previewQuestions?: QuestionItem[];
    liveQuestions?: QuestionItem[];
    questions?: QuestionItem[];
  };
  company: string;
  role: string;
  language: string;
  jobDescription?: string;
  startedAt: string;
}

interface QuestionEvaluation {
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
}

export default function InterviewPage() {
  const router = useRouter();

  // Session State
  const [sessionData, setSessionData] = useState<InterviewSessionData | null>(null);
  const [activeQuestionList, setActiveQuestionList] = useState<QuestionItem[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [activeQuestionText, setActiveQuestionText] = useState("");
  const [evaluations, setEvaluations] = useState<QuestionEvaluation[]>([]);

  // Latency metrics
  const [sttLatency, setSttLatency] = useState<number | null>(null);
  const [ttsLatency, setTtsLatency] = useState<number | null>(null);

  // Audio & Voice Loop State
  const [waveformMode, setWaveformMode] = useState<WaveformMode>("idle");
  const [statusMessage, setStatusMessage] = useState("Initializing live audio studio...");
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [dualTranscripts, setDualTranscripts] = useState<Record<string, string> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fallback Text Input Mode
  const [isTextMode, setIsTextMode] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState("");

  // Audio Recorder Hook
  const {
    isRecording,
    volumeLevel,
    recordingDuration,
    error: recorderError,
    startRecording,
    stopRecording,
  } = useAudioRecorder();

  const loopActiveRef = useRef(false);
  const activeAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const playbackCtxRef = useRef<AudioContext | null>(null);

  // Load Session from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = localStorage.getItem("interviewsetu_session");
    if (raw) {
      try {
        const parsed: InterviewSessionData = JSON.parse(raw);
        setSessionData(parsed);

        // Prioritize liveQuestions over previewQuestions so the live interview is fresh and deeper
        const questionsToUse =
          parsed.blueprint?.liveQuestions && parsed.blueprint.liveQuestions.length > 0
            ? parsed.blueprint.liveQuestions
            : parsed.blueprint?.questions || [];

        setActiveQuestionList(questionsToUse);

        if (questionsToUse.length > 0) {
          setActiveQuestionText(questionsToUse[0].question);
        }
      } catch (err) {
        console.error("Failed to parse session data:", err);
      }
    } else {
      // Fallback demo session if visited directly
      const mock: InterviewSessionData = {
        blueprint: {
          candidateName: "Parth Patel",
          extractedSkills: ["React", "Node.js", "Redis", "PostgreSQL"],
          extractedProjects: ["Real-time WebSocket Chat Microservice"],
          companyFocus: "Swiggy",
          language: "Hinglish",
          jobDescriptionSummary:
            "High concurrency real-time logistics ordering, distributed event queues, low latency microservices.",
          previewQuestions: [
            {
              id: 1,
              type: "project_deep_dive",
              question:
                "Parth, apne resume me likha hai ki aapne Redis use kiya tha chat service me. Can you explain cache invalidation and connection heartbeat kaise handle kiya?",
              intent: "Assess distributed caching and WebSocket resiliency under load",
            },
            {
              id: 2,
              type: "technical_theory",
              question:
                "Swiggy scale par agar peak lunch hour me 100,000 orders ek sath drop ho rahe hain, toh database write bottleneck ko aap kaise mitigate karenge?",
              intent: "Assess message queuing and database sharding rationale",
            },
            {
              id: 3,
              type: "behavioral_scenario",
              question:
                "Tell me about a time jab production me koi critical bug deploy ho gaya tha. How did you diagnose and rollback?",
              intent: "Assess incident management and engineering ownership",
            },
          ],
          liveQuestions: [
            {
              id: 1,
              type: "project_deep_dive",
              question:
                "Parth, resume me Redis chat service mentioned hai. Imagine kariye high concurrency peak traffic par agar ek Redis node fail ho jata hai ya network partition hota hai, toh message drops aur reconnect storm se server collapse ko aapne kaise prevent kiya?",
              intent: "Evaluate production resilience, failover mechanics, and state reconciliation under sudden partition",
            },
            {
              id: 2,
              type: "technical_theory",
              question:
                "Swiggy ke real-time order tracking pipeline me, driver location updates har 3 seconds me aate hain. Redis geo-hashing ya Kafka streaming me se aap kaunsa architecture choose karenge aur latency SLA kaise guarantee karenge?",
              intent: "Assess real-time geo-spatial indexing and distributed event streaming trade-offs",
            },
            {
              id: 3,
              type: "behavioral_scenario",
              question:
                "Suppose Diwali rush ke dauran payment gateway response timeout 45% jump kar gaya aur customers double charge ho rahe hain. On-call engineer ke roop me aapka immediate 15-minute action plan kya hoga?",
              intent: "Evaluate live outage containment, idempotent transactions, and pressure management",
            },
          ],
        },
        company: "Swiggy",
        role: "Fullstack Engineer",
        language: "Hinglish",
        startedAt: new Date().toISOString(),
      };
      setSessionData(mock);
      setActiveQuestionList(mock.blueprint.liveQuestions || []);
      setActiveQuestionText(mock.blueprint.liveQuestions![0].question);
    }
  }, []);

  // Web Audio buffer playback helper (Zero first-syllable clipping)
  const playTTSAudio = useCallback(
    async (text: string, language: string): Promise<void> => {
      return new Promise(async (resolve) => {
        try {
          setWaveformMode("ai-speaking");
          setStatusMessage("Interviewer is speaking...");

          const voice = language === "Hindi" ? "Bhavna" : "Nalini";
          const startTime = performance.now();

          const res = await fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, language, voice }),
          });

          if (!res.ok) {
            console.warn("TTS API failed, falling back to Web Speech API");
            fallbackWebSpeech(text, language, resolve);
            return;
          }

          const latency = Math.round(performance.now() - startTime);
          setTtsLatency(latency);

          const arrayBuffer = await res.arrayBuffer();
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          const ctx = new AudioCtx();
          playbackCtxRef.current = ctx;

          // Decode Linear PCM WAV in browser
          const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
          const source = ctx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(ctx.destination);
          activeAudioSourceRef.current = source;

          source.onended = () => {
            setWaveformMode("idle");
            try {
              ctx.close();
            } catch (_) {}
            // Provide a smooth 400ms buffer before mic activation to prevent echo
            setTimeout(resolve, 400);
          };

          // Pristine playback from sample 0
          source.start(0);
        } catch (err) {
          console.error("playTTSAudio error:", err);
          fallbackWebSpeech(text, language, resolve);
        }
      });
    },
    []
  );

  // Web Speech API fallback if Gnani TTS times out or fails
  const fallbackWebSpeech = (
    text: string,
    language: string,
    onComplete: () => void
  ) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === "Hindi" ? "hi-IN" : "en-IN";
      utterance.rate = 1.0;
      utterance.onend = () => {
        setWaveformMode("idle");
        setTimeout(onComplete, 400);
      };
      utterance.onerror = () => {
        setWaveformMode("idle");
        setTimeout(onComplete, 400);
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(onComplete, 2000);
    }
  };

  // Kick off voice loop for a question
  const startQuestionTurn = useCallback(
    async (questionText: string, lang: string) => {
      if (loopActiveRef.current) return;
      loopActiveRef.current = true;

      setActiveQuestionText(questionText);
      setCurrentTranscript("");
      setDualTranscripts(null);

      // 1. Play TTS
      await playTTSAudio(questionText, lang);

      // 2. Automatically activate Mic for candidate
      if (!isTextMode) {
        setStatusMessage("Listening to you... Speak your answer");
        setWaveformMode("candidate-speaking");
        try {
          await startRecording();
        } catch (err) {
          console.error("Auto mic start failed:", err);
          setIsTextMode(true);
        }
      } else {
        setStatusMessage("Type your answer below and press Submit");
        setWaveformMode("idle");
      }

      loopActiveRef.current = false;
    },
    [playTTSAudio, startRecording, isTextMode]
  );

  // Trigger first live question when session and question list are ready
  useEffect(() => {
    if (sessionData && activeQuestionList.length > 0) {
      const q1 = activeQuestionList[0].question;
      const lang = sessionData.language || "Hinglish";
      startQuestionTurn(q1, lang);
    }
  }, [activeQuestionList]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle Answer Submission (via Audio or Text)
  const handleCompleteAnswer = async (manualText?: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setWaveformMode("processing");
    setStatusMessage("Transcribing with Gnani Prisma & evaluating...");

    let transcript = manualText || "";
    let extractedDual: Record<string, string> | null = null;

    try {
      // 1. If recording audio, stop and transcribe
      if (!manualText) {
        const audioBlob = await stopRecording();
        if (audioBlob && audioBlob.size > 0) {
          const startTime = performance.now();
          const formData = new FormData();
          formData.append("audio_file", audioBlob, "answer.wav");
          formData.append("language_code", "indic-auto");
          formData.append("multi_lang_codes", "hi-IN,en-IN");

          const sttRes = await fetch("/api/stt", {
            method: "POST",
            body: formData,
          });

          const sttData = await sttRes.json();
          const latency = Math.round(performance.now() - startTime);
          setSttLatency(latency);

          if (sttRes.ok && sttData.transcript) {
            transcript = sttData.transcript;
            if (sttData.transcripts) {
              extractedDual = sttData.transcripts;
              setDualTranscripts(sttData.transcripts);
            }
          } else {
            transcript = "Candidate gave a spoken answer in technical Hinglish.";
          }
        } else {
          transcript = "Candidate did not provide a recorded answer.";
        }
      }

      setCurrentTranscript(transcript);

      // Context includes both projects and Job Description summary for high-precision grading
      const contextSummary = [
        sessionData?.blueprint?.extractedProjects?.join(", ") || "",
        sessionData?.blueprint?.jobDescriptionSummary
          ? `Target JD Core Focus: ${sessionData.blueprint.jobDescriptionSummary}`
          : "",
      ]
        .filter(Boolean)
        .join(" | ");

      // 2. Evaluate answer with Gemini
      const evalRes = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentQuestion: activeQuestionText,
          candidateAnswer: transcript,
          resumeContext: contextSummary,
          company: sessionData?.company || "Tech Company",
          role: sessionData?.role || "Software Engineer",
          language: sessionData?.language || "Hinglish",
          questionIndex: currentQuestionIndex,
          totalQuestions: activeQuestionList.length || 3,
        }),
      });

      const evalData = await evalRes.json();
      if (!evalRes.ok || !evalData.success) {
        throw new Error(evalData.error || "Failed to evaluate answer.");
      }

      const evaluation = evalData.evaluation;

      // 3. Store in evaluation history
      const newEvaluationRecord: QuestionEvaluation = {
        question: activeQuestionText,
        answer: transcript,
        transcripts: extractedDual || undefined,
        score: evaluation.score,
        verbalFeedback: evaluation.verbalFeedback,
        keyStrengths: evaluation.keyStrengths || [],
        areasToImprove: evaluation.areasToImprove || [],
      };

      const updatedEvaluations = [...evaluations, newEvaluationRecord];
      setEvaluations(updatedEvaluations);

      // 4. Determine next step
      const totalQ = activeQuestionList.length || 3;
      const isComplete =
        evaluation.nextAction === "complete" || currentQuestionIndex >= totalQ - 1;

      // Speak feedback out loud first
      setStatusMessage("Interviewer is providing verbal feedback...");
      await playTTSAudio(evaluation.verbalFeedback, sessionData?.language || "Hinglish");

      if (isComplete) {
        // Compile final report data and route to /report
        setStatusMessage("Interview complete! Compiling performance scorecard...");
        const reportPayload = {
          session: sessionData,
          evaluations: updatedEvaluations,
          completedAt: new Date().toISOString(),
        };
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "interviewsetu_report",
            JSON.stringify(reportPayload)
          );
        }
        router.push("/report");
      } else {
        // Proceed to next live question
        const nextIdx = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIdx);

        let nextQuestionText =
          evaluation.nextAction === "follow_up" && evaluation.followUpQuestion
            ? evaluation.followUpQuestion
            : activeQuestionList[nextIdx]?.question ||
              "Next question regarding system architecture and reliability.";

        setTypedAnswer("");
        startQuestionTurn(nextQuestionText, sessionData?.language || "Hinglish");
      }
    } catch (err: any) {
      console.error("Answer loop error:", err);
      setStatusMessage(`Notice: ${err.message}. Retrying or switch to text mode.`);
      setWaveformMode("idle");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedAnswer.trim()) return;
    handleCompleteAnswer(typedAnswer);
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] flex flex-col justify-between">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 flex flex-col justify-between space-y-6">
        {/* Top Control & Live Latency Bar */}
        <div className="flex items-center justify-between border-b border-[#232B3E] pb-3 text-xs font-mono text-[#94A3B8]">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-[#121620] border border-[#232B3E] text-[#F8FAFC]">
              <span className="text-[#F59E0B] font-semibold">{sessionData?.company || "Company"}</span>
              <span>•</span>
              <span className="text-[#94A3B8]">{sessionData?.role || "Role"}</span>
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-[#121620] border border-[#232B3E] text-[11px] text-[#3B82F6]">
              {sessionData?.language || "Hinglish"} Mode
            </span>
          </div>

          <div className="flex items-center space-x-2.5">
            {/* Live STT Latency Pill */}
            {sttLatency !== null && (
              <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 text-[11px] font-mono text-[#10B981]">
                <Zap className="w-3 h-3 text-[#10B981]" />
                <span>⚡ STT: {sttLatency}ms</span>
              </span>
            )}
            {/* Live TTS Latency Pill */}
            {ttsLatency !== null && (
              <span className="hidden md:flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/30 text-[11px] font-mono text-[#3B82F6]">
                <Volume2 className="w-3 h-3 text-[#3B82F6]" />
                <span>TTS: {ttsLatency}ms</span>
              </span>
            )}
            <span className="px-2.5 py-1 rounded bg-[#1A202C] border border-[#232B3E] text-[#F8FAFC]">
              Live Question {currentQuestionIndex + 1} / {activeQuestionList.length || 3}
            </span>
          </div>
        </div>

        {/* Center: The Minimalist Voice Studio Focus */}
        <div className="flex-1 flex flex-col items-center justify-center py-4 space-y-6 text-center">
          {/* Question Display Card */}
          <div className="max-w-2xl w-full p-6 rounded-2xl bg-[#121620] border border-[#232B3E] shadow-lg space-y-3">
            <div className="flex items-center justify-center space-x-2 text-xs font-mono text-[#F59E0B]">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="uppercase tracking-wider">
                {activeQuestionList[currentQuestionIndex]?.type?.replace(/_/g, " ") ||
                  "Live Round"}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                Dynamic Deep Dive
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-medium text-[#F8FAFC] leading-relaxed">
              &ldquo;{activeQuestionText || "Preparing next question..."}&rdquo;
            </h2>

            <p className="text-xs text-[#94A3B8] font-mono">
              Intent:{" "}
              {activeQuestionList[currentQuestionIndex]?.intent ||
                "Assessing technical reasoning & JD alignment"}
            </p>
          </div>

          {/* Dynamic Soundwave Visualizer */}
          <div className="w-full max-w-lg py-2">
            <AudioWaveform
              mode={waveformMode}
              volumeLevel={volumeLevel}
              statusLabel={statusMessage}
            />
          </div>

          {/* Interactive Controls & Recording Indicator */}
          <div className="flex flex-col items-center space-y-3">
            {isRecording && (
              <div className="flex items-center space-x-2 text-xs font-mono text-[#10B981]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
                <span>Recording Spoken Answer • {recordingDuration}s</span>
              </div>
            )}

            <div className="flex items-center space-x-3">
              {!isTextMode ? (
                <>
                  {isRecording ? (
                    <button
                      type="button"
                      onClick={() => handleCompleteAnswer()}
                      disabled={isProcessing}
                      className="px-6 py-3 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#0A0D14] font-semibold text-sm flex items-center space-x-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50"
                    >
                      <Square className="w-4 h-4 fill-current" />
                      <span>Done Answering (Send to STT)</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={startRecording}
                      disabled={isProcessing || waveformMode === "ai-speaking"}
                      className="px-6 py-3 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#0A0D14] font-semibold text-sm flex items-center space-x-2 transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] disabled:opacity-50"
                    >
                      <Mic className="w-4 h-4" />
                      <span>{isProcessing ? "Processing..." : "Start Speaking Answer"}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsTextMode(true)}
                    className="p-3 rounded-xl bg-[#121620] border border-[#232B3E] hover:border-[#334155] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
                    title="Switch to typing (Microphone fallback)"
                  >
                    <Keyboard className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsTextMode(false)}
                  className="text-xs font-mono text-[#F59E0B] underline underline-offset-4 flex items-center space-x-1"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Switch back to Voice Mic Mode</span>
                </button>
              )}
            </div>

            {recorderError && (
              <p className="text-xs text-red-400 font-mono flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{recorderError}</span>
              </p>
            )}
          </div>
        </div>

        {/* Text Fallback Input (when isTextMode is true) */}
        {isTextMode && (
          <form
            onSubmit={handleManualTextSubmit}
            className="w-full max-w-2xl mx-auto p-4 rounded-xl bg-[#121620] border border-[#232B3E] space-y-3"
          >
            <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8]">
              <span>Audio Fallback: Type Your Response</span>
              <span className="text-[11px] text-[#F59E0B]">
                Hinglish / English / Hindi supported
              </span>
            </div>
            <textarea
              value={typedAnswer}
              onChange={(e) => setTypedAnswer(e.target.value)}
              placeholder="Type your spoken answer here (e.g., Maine Redis pub-sub use kiya tha aur cluster mode enable kiya tha)..."
              rows={3}
              className="w-full bg-[#0A0D14] border border-[#232B3E] rounded-lg p-3 text-sm text-[#F8FAFC] placeholder:text-[#94A3B8]/60 focus:outline-none focus:border-[#F59E0B] resize-none font-mono"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isProcessing || !typedAnswer.trim()}
                className="px-4 py-2 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] text-[#0A0D14] font-semibold text-xs flex items-center space-x-1.5 transition-all disabled:opacity-50"
              >
                <span>Submit Answer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        {/* Bottom: Real-Time Dual Transcript & Caption Card */}
        <div className="w-full max-w-3xl mx-auto p-4 rounded-xl bg-[#121620] border border-[#232B3E] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8]">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
              <span>Gnani Live Transcript Caption Bar</span>
            </span>
            {dualTranscripts && (
              <span className="text-[11px] text-[#10B981]">
                Dual Hinglish/Devanagari Decoded
              </span>
            )}
          </div>

          <div className="min-h-[44px] flex flex-col justify-center text-sm font-mono text-[#F8FAFC] bg-[#0A0D14] p-3 rounded-lg border border-[#232B3E]">
            {currentTranscript ? (
              <div className="space-y-1">
                <p className="text-[#F8FAFC] leading-relaxed">
                  &ldquo;{currentTranscript}&rdquo;
                </p>
                {dualTranscripts && dualTranscripts["en-IN"] && dualTranscripts["hi-IN"] && (
                  <p className="text-xs text-[#94A3B8]">
                    Hinglish: {dualTranscripts["en-IN"]}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-[#94A3B8]/60 italic">
                Captions will appear here when you or the interviewer speak...
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
