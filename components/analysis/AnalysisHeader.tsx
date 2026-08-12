'use client';

import React from 'react';
import { useAnalysisStore } from '@/store/analysis-store';
import { CheckCircle2, Circle, Loader2, Globe, RefreshCw, AlertOctagon } from 'lucide-react';

export const AnalysisHeader: React.FC = () => {
  const { url, status, stage, stageMessage, error, result, reset, startAnalysis } = useAnalysisStore();

  if (status === 'analyzing') {
    const stagesList = [
      { key: 'launching', label: 'Launching Playwright Chromium' },
      { key: 'loading', label: 'Loading page content & scripts' },
      { key: 'capturing', label: 'Capturing HTTP network payloads' },
      { key: 'analyzing', label: 'Evaluating 10 audit rules' },
    ];

    const currentIdx = stagesList.findIndex((s) => s.key === stage);

    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 border border-slate-300 text-slate-900 mb-6">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>

          <h2 className="text-xl font-bold font-sans text-slate-900 sm:text-2xl">
            Analyzing <span className="underline decoration-slate-400">{url}</span>
          </h2>
          <p className="mt-2 text-xs font-mono text-slate-500">{stageMessage}</p>

          {/* Stages checklist */}
          <div className="mt-8 mx-auto max-w-md space-y-3 text-left">
            {stagesList.map((s, idx) => {
              const isDone = currentIdx > idx;
              const isCurrent = currentIdx === idx;

              return (
                <div key={s.key} className="flex items-center gap-3 font-mono text-xs">
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4 text-slate-900 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="h-4 w-4 text-slate-900 animate-spin shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-slate-300 shrink-0" />
                  )}
                  <span
                    className={
                      isDone
                        ? 'text-slate-700 font-medium'
                        : isCurrent
                        ? 'text-black font-bold'
                        : 'text-slate-400'
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
        <div className="rounded-2xl border border-rose-300 bg-white p-8 shadow-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 border border-rose-300 text-rose-700 mb-4">
            <AlertOctagon className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold font-sans text-slate-900">Analysis Failed</h2>
          <p className="mt-3 text-xs font-mono text-rose-800 bg-rose-50 border border-rose-200 rounded-lg p-3">
            {error || 'Unable to analyze target website.'}
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => startAnalysis(url)}
              className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 font-sans text-xs font-bold text-white hover:bg-slate-800 transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try Again
            </button>
            <button
              onClick={reset}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-sans text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all"
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
      <div className="border-b border-slate-200 bg-slate-50 py-4">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white">
              <Globe className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-sans text-base font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                  {result.domain}
                </h1>
              </div>
              <p className="text-[11px] font-mono text-slate-500 truncate max-w-xs sm:max-w-lg">
                {result.url}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-500 hidden md:block">
              Analyzed {new Date(result.timestamp).toLocaleTimeString()}
            </span>
            <button
              onClick={() => startAnalysis(result.url)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 font-sans text-xs font-bold text-slate-900 hover:bg-slate-100 transition-all shadow-sm"
            >
              <RefreshCw className="h-3.5 w-3.5 text-slate-700" />
              Re-analyze
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
