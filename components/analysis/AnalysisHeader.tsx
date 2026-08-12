'use client';

import React from 'react';
import { useAnalysisStore } from '@/store/analysis-store';
import { CheckCircle2, Circle, Loader2, Globe, RefreshCw, AlertOctagon } from 'lucide-react';

export const AnalysisHeader: React.FC = () => {
  const { url, status, stage, stageMessage, error, result, reset, startAnalysis } = useAnalysisStore();

  if (status === 'analyzing') {
    const stagesList = [
      { key: 'launching', label: 'Launching browser engine' },
      { key: 'loading', label: 'Loading page content' },
      { key: 'capturing', label: 'Capturing network payloads' },
      { key: 'analyzing', label: 'Evaluating performance rules' },
    ];

    const currentIdx = stagesList.findIndex((s) => s.key === stage);

    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 mb-6">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>

          <h2 className="text-xl font-bold font-mono text-slate-100 sm:text-2xl">
            Analyzing <span className="text-sky-400">{url}</span>
          </h2>
          <p className="mt-2 text-xs font-mono text-slate-400">{stageMessage}</p>

          {/* Stages checklist */}
          <div className="mt-8 mx-auto max-w-md space-y-3 text-left">
            {stagesList.map((s, idx) => {
              const isDone = currentIdx > idx;
              const isCurrent = currentIdx === idx;

              return (
                <div key={s.key} className="flex items-center gap-3 font-mono text-xs">
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="h-4 w-4 text-sky-400 animate-spin shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-slate-600 shrink-0" />
                  )}
                  <span
                    className={
                      isDone
                        ? 'text-slate-300'
                        : isCurrent
                        ? 'text-sky-400 font-semibold'
                        : 'text-slate-500'
                    }
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <div className="rounded-2xl border border-rose-500/30 bg-slate-900/90 p-8 shadow-2xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 mb-4">
            <AlertOctagon className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold font-mono text-slate-100">Analysis Failed</h2>
          <p className="mt-3 text-xs font-mono text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
            {error || 'Unable to analyze target website.'}
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => startAnalysis(url)}
              className="flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 font-mono text-xs font-semibold text-slate-950 hover:bg-sky-400 transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try Again
            </button>
            <button
              onClick={reset}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 font-mono text-xs text-slate-300 hover:text-white transition-all"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'complete' && result) {
    return (
      <div className="border-b border-slate-800 bg-slate-900/60 py-4">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-sky-400 border border-slate-700">
              <Globe className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-mono text-base font-bold text-slate-100 truncate max-w-xs sm:max-w-md">
                  {result.domain}
                </h1>
              </div>
              <p className="text-[11px] font-mono text-slate-400 truncate max-w-xs sm:max-w-lg">
                {result.url}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400 hidden md:block">
              Analyzed {new Date(result.timestamp).toLocaleTimeString()}
            </span>
            <button
              onClick={() => startAnalysis(result.url)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 font-mono text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5 text-sky-400" />
              Re-analyze
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
