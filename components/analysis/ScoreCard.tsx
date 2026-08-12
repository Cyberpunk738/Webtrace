'use client';

import React from 'react';

interface ScoreCardProps {
  score: number;
  category: 'Excellent' | 'Good' | 'Needs Improvement' | 'Poor';
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ score, category }) => {
  let colorClass = 'text-slate-900 border-slate-200 bg-white';
  let gaugeColor = 'text-emerald-600';
  let badgeBg = 'bg-emerald-600 text-white';

  if (category === 'Good') {
    gaugeColor = 'text-sky-600';
    badgeBg = 'bg-sky-600 text-white';
  } else if (category === 'Needs Improvement') {
    gaugeColor = 'text-amber-600';
    badgeBg = 'bg-amber-600 text-white';
  } else if (category === 'Poor') {
    gaugeColor = 'text-rose-600';
    badgeBg = 'bg-rose-600 text-white';
  }

  // Calculate SVG stroke offset for circular gauge
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={`relative flex flex-col items-center justify-center rounded-xl border p-5 transition-all shadow-sm ${colorClass}`}>
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
          <span className="font-mono text-3xl font-extrabold tracking-tight text-slate-950">{score}</span>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">/ 100</span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5">
        <span className={`px-2 py-0.5 rounded font-mono text-xs font-bold uppercase tracking-wider ${badgeBg}`}>
          {category}
        </span>
      </div>
      <p className="mt-1.5 text-[11px] font-mono text-slate-500 font-medium">Performance Score</p>
    </div>
  );
};
