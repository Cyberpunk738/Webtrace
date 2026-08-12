'use client';

import React from 'react';
import { Activity, Terminal } from 'lucide-react';
import { useAnalysisStore } from '@/store/analysis-store';

export const Header: React.FC = () => {
  const { status, reset } = useAnalysisStore();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-[#090d16]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
        <div className="flex items-center gap-3 cursor-pointer" onClick={reset}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-bold tracking-wider text-slate-100">WebTrace</span>
              <span className="rounded bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-mono font-medium text-sky-400 border border-sky-500/20">
                MVP v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Website Performance Intelligence Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {status === 'complete' && (
            <button
              onClick={reset}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-all"
            >
              <Terminal className="h-3.5 w-3.5 text-sky-400" />
              Analyze New Site
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
