"use client";

import React from "react";

interface ScoreCardProps {
  score: number;
  category: "Excellent" | "Good" | "Needs Improvement" | "Poor";
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ score, category }) => {
  const colorClass = "text-[#f6f3e9] border-[#424137] bg-[#252525]";
  let gaugeColor = "text-emerald-300";
  let badgeBg = "bg-emerald-300 text-[#181818]";

  if (category === "Good") {
    gaugeColor = "text-sky-300";
    badgeBg = "bg-sky-300 text-[#181818]";
  } else if (category === "Needs Improvement") {
    gaugeColor = "text-amber-300";
    badgeBg = "bg-amber-300 text-[#181818]";
  } else if (category === "Poor") {
    gaugeColor = "text-rose-300";
    badgeBg = "bg-rose-300 text-[#181818]";
  }

  // Calculate SVG stroke offset for circular gauge
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div
      className={`relative flex flex-col items-center justify-center rounded-xl border p-5 transition-all shadow-sm ${colorClass}`}
    >
      <div className="relative flex items-center justify-center">
        <svg className="h-24 w-24 transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="7"
            className="text-slate-100"
            fill="transparent"
          />
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="7"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`transition-all duration-1000 ease-out ${gaugeColor}`}
            fill="transparent"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center">
          <span className="font-mono text-3xl font-extrabold tracking-tight text-[#f6f3e9]">
            {score}
          </span>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#aaa69c]">
            / 100
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5">
        <span
          className={`px-2 py-0.5 rounded font-mono text-xs font-bold uppercase tracking-wider ${badgeBg}`}
        >
          {category}
        </span>
      </div>
      <p className="mt-1.5 text-[11px] font-mono text-[#aaa69c] font-medium">
        Performance Score
      </p>
    </div>
  );
};
