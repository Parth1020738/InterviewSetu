"use client";

import React, { useState } from "react";
import { Building2, Sparkles, Check } from "lucide-react";

interface CompanyOption {
  id: string;
  name: string;
  category: string;
  tagline: string;
  typicalFocus: string;
}

const COMPANIES: CompanyOption[] = [
  {
    id: "swiggy",
    name: "Swiggy",
    category: "Hyperlocal / Unicorn",
    tagline: "High-concurrency order dispatch & low latency APIs",
    typicalFocus: "Kafka event streams, Redis geo-hashing, microservices",
  },
  {
    id: "zomato",
    name: "Zomato",
    category: "Consumer Tech",
    tagline: "Scalable dining & logistics backend",
    typicalFocus: "Database indexing, load spikes, distributed caching",
  },
  {
    id: "google",
    name: "Google",
    category: "Big Tech",
    tagline: "Core engineering, algorithmic depth & system reliability",
    typicalFocus: "Concurrency primitives, memory management, data structures",
  },
  {
    id: "tcs",
    name: "TCS / Infosys",
    category: "IT Services",
    tagline: "Enterprise systems, reliability & structured coding",
    typicalFocus: "OOP principles, SQL queries, clean APIs, unit testing",
  },
  {
    id: "startup",
    name: "Early-Stage AI Startup",
    category: "High Velocity",
    tagline: "Fast fullstack shipping, problem solving & ambiguity",
    typicalFocus: "End-to-end features, rapid debugging, fullstack architecture",
  },
];

interface CompanySelectorProps {
  selectedCompany: string;
  onSelectCompany: (company: string) => void;
  selectedRole: string;
  onSelectRole: (role: string) => void;
}

export function CompanySelector({
  selectedCompany,
  onSelectCompany,
  selectedRole,
  onSelectRole,
}: CompanySelectorProps) {
  const [customMode, setCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState("");

  const roles = [
    "Fullstack Engineer (React + Node)",
    "Frontend Engineer (React / Next.js)",
    "Backend Engineer (Node / Java / Go)",
    "Data Analyst / Python",
    "GenAI / LLM Application Developer",
  ];

  return (
    <div className="w-full space-y-4">
      {/* Role Selection */}
      <div className="space-y-2">
        <label className="text-xs font-mono uppercase tracking-wider text-[#94A3B8] flex items-center justify-between">
          <span>02. Target Role</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {roles.map((role) => {
            const isSelected = selectedRole === role;
            return (
              <button
                key={role}
                type="button"
                onClick={() => onSelectRole(role)}
                className={`p-2.5 rounded-lg text-left text-xs font-medium transition-all border ${
                  isSelected
                    ? "bg-[#1A202C] text-[#F59E0B] border-[#F59E0B]/50 shadow-sm"
                    : "bg-[#121620] text-[#94A3B8] border-[#232B3E] hover:border-[#334155] hover:text-[#F8FAFC]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{role}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#F59E0B] flex-shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Company Selection */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono uppercase tracking-wider text-[#94A3B8]">
            <span>03. Target Company Pattern</span>
          </label>
          <button
            type="button"
            onClick={() => setCustomMode(!customMode)}
            className="text-xs text-[#94A3B8] hover:text-[#F8FAFC] font-mono underline underline-offset-4"
          >
            {customMode ? "Select preset companies" : "+ Custom company"}
          </button>
        </div>

        {customMode ? (
          <div className="p-3 bg-[#121620] border border-[#232B3E] rounded-xl flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-[#94A3B8]" />
            <input
              type="text"
              value={customInput}
              onChange={(e) => {
                setCustomInput(e.target.value);
                onSelectCompany(e.target.value);
              }}
              placeholder="e.g. Zerodha, CRED, Razorpay, or your target firm..."
              className="w-full bg-transparent text-sm text-[#F8FAFC] placeholder:text-[#94A3B8]/60 focus:outline-none"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {COMPANIES.map((comp) => {
              const isSelected = selectedCompany === comp.name;
              return (
                <button
                  key={comp.id}
                  type="button"
                  onClick={() => onSelectCompany(comp.name)}
                  className={`p-3 rounded-xl text-left transition-all border ${
                    isSelected
                      ? "bg-[#1A202C] border-[#F59E0B]/60 shadow-[0_0_15px_rgba(245,158,11,0.08)]"
                      : "bg-[#121620] border-[#232B3E] hover:border-[#334155] hover:bg-[#151a26]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-[#F8FAFC]">
                      {comp.name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0A0D14] border border-[#232B3E] text-[#94A3B8]">
                      {comp.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8] line-clamp-1 mb-1.5">
                    {comp.tagline}
                  </p>
                  <div className="text-[10px] font-mono text-[#F59E0B]/80 flex items-center space-x-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span className="truncate">{comp.typicalFocus}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
