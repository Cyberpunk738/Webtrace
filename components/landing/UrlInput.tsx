'use client';

import React, { useState } from 'react';
import { Search, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { validateAndNormalizeUrl } from '@/lib/url';
import { useAnalysisStore } from '@/store/analysis-store';

export const UrlInput: React.FC = () => {
  const [inputVal, setInputVal] = useState('');
  const [validationErr, setValidationErr] = useState<string | null>(null);
  const { startAnalysis, status } = useAnalysisStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErr(null);

    const valResult = validateAndNormalizeUrl(inputVal);
    if (!valResult.valid || !valResult.normalizedUrl) {
      setValidationErr(valResult.error || 'Please enter a valid website URL.');
      return;
    }

    startAnalysis(valResult.normalizedUrl);
  };

  const handleQuickSelect = (url: string) => {
    setInputVal(url);
    setValidationErr(null);
    startAnalysis(url);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center rounded-xl border border-slate-700/80 bg-slate-900/90 p-1.5 shadow-2xl shadow-sky-950/20 focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500/50 transition-all">
          <div className="pl-3.5 pr-2 text-slate-400">
            <Search className="h-5 w-5" />
          </div>

          <input
            type="text"
            value={inputVal}
            onChange={(e) => {
              setInputVal(e.target.value);
              if (validationErr) setValidationErr(null);
            }}
            placeholder="https://example.com"
            disabled={status === 'analyzing'}
            className="w-full bg-transparent px-2 py-2.5 font-mono text-sm text-slate-100 placeholder-slate-500 focus:outline-none disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={status === 'analyzing' || !inputVal.trim()}
            className="flex items-center gap-2 rounded-lg bg-sky-500 px-5 py-2.5 font-mono text-xs font-semibold text-slate-950 hover:bg-sky-400 active:bg-sky-600 disabled:opacity-40 disabled:hover:bg-sky-500 transition-all shadow-md shadow-sky-500/20 whitespace-nowrap"
          >
            {status === 'analyzing' ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                Analyzing...
              </>
            ) : (
              <>
                Analyze Website
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {validationErr && (
          <div className="mt-2.5 flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-mono text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{validationErr}</span>
          </div>
        )}
      </form>

      {/* Security & Presets */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400 font-mono">
          <span>Try:</span>
          {['https://example.com', 'https://wikipedia.org', 'https://github.com'].map((site) => (
            <button
              key={site}
              type="button"
              onClick={() => handleQuickSelect(site)}
              className="rounded border border-slate-800 bg-slate-900/60 px-2 py-0.5 text-slate-300 hover:border-slate-700 hover:text-sky-400 transition-all"
            >
              {site.replace('https://', '')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Protected with SSRF Security Filters</span>
        </div>
      </div>
    </div>
  );
};
