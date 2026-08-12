'use client';

import React from 'react';
import { Activity, Terminal } from 'lucide-react';
import { useAnalysisStore } from '@/store/analysis-store';

export const Header: React.FC = () => {
  const { status, reset } = useAnalysisStore();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        {/* Brand logo */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={reset}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white group-hover:bg-slate-800 transition-colors">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans text-lg font-bold tracking-tight text-slate-900">
                WebTrace
              </span>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-600 border border-slate-200">
                v1.0
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          {status === 'complete' ? (
            <button
              onClick={reset}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 font-sans text-xs font-bold text-slate-900 hover:bg-slate-50 transition-all shadow-sm"
            >
              <Terminal className="h-3.5 w-3.5 text-slate-700" />
              Analyze New Site
            </button>
          ) : (
            <button
              onClick={() => {
                const inputEl = document.querySelector('input[type="text"]') as HTMLInputElement;
                if (inputEl) inputEl.focus();
              }}
              className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 font-sans text-xs font-bold text-white hover:bg-slate-800 transition-all shadow-sm"
            >
              <span>Start analysis</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
