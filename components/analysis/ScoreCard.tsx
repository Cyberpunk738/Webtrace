'use client';

import React from 'react';

interface ScoreCardProps {
  score: number;
  category: 'Excellent' | 'Good' | 'Needs Improvement' | 'Poor';
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ score, category }) => {
  let colorClass = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  let badgeBg = 'bg-emerald-400';

  if (category === 'Good') {
    colorClass = 'text-sky-400 border-sky-500/30 bg-sky-500/10';
    badgeBg = 'bg-sky-400';
  } else if (category === 'Needs Improvement') {
    colorClass = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    badgeBg = 'bg-amber-400';
  } else if (category === 'Poor') {
    colorClass = 'text-rose-400 border-rose-500/30 bg-rose-500/10';
    badgeBg = 'bg-rose-400';
  }

  // Calculate SVG stroke offset for circular gauge
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={`relative flex flex-col items-center justify-center rounded-xl border p-5 transition-all shadow-lg ${colorClass}`}>
      <div className="relative flex items-center justify-center">
        <svg className="h-24 w-24 transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="7"
            className="text-slate-800"
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
            className="transition-all duration-1000 ease-out"
            fill="transparent"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center">
          <span className="font-mono text-3xl font-extrabold tracking-tight text-slate-100">{score}</span>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">/ 100</span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5">
        <span className={`h-2 w-2 rounded-full ${badgeBg}`} />
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
          {category}
        </span>
      </div>
      <p className="mt-1 text-[11px] font-mono text-slate-400">Performance Score</p>
    </div>
  );
};
