'use client';

import React, { useState } from 'react';
import { Globe, ArrowRight, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
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
    <div className="w-full max-w-xl">
      <form onSubmit={handleSubmit} className="relative space-y-3">
        <div className="relative flex items-center rounded-xl border border-slate-300 bg-white p-1.5 shadow-lg focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
          <div className="pl-3.5 pr-3 flex items-center gap-2 text-slate-500 font-mono text-xs border-r border-slate-200">
            <Globe className="h-4 w-4 text-slate-900" />
            <span className="hidden sm:inline">https://</span>
          </div>

          <input
            type="text"
            value={inputVal}
            onChange={(e) => {
              setInputVal(e.target.value);
              if (validationErr) setValidationErr(null);
            }}
            placeholder="example.com"
            disabled={status === 'analyzing'}
            className="w-full bg-transparent px-3 py-2.5 font-mono text-sm text-slate-900 placeholder-slate-400 focus:outline-none disabled:opacity-50"
          />

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={status === 'analyzing' || !inputVal.trim()}
              className="flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 font-sans text-xs font-bold text-white hover:bg-slate-800 active:bg-slate-900 disabled:opacity-40 transition-all shadow-sm whitespace-nowrap"
            >
              {status === 'analyzing' ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {validationErr && (
          <div className="flex items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 px-3.5 py-2 text-xs font-mono text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{validationErr}</span>
          </div>
        )}
      </form>

      {/* Security & Presets */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-600 font-sans">
          <Sparkles className="h-3.5 w-3.5 text-slate-900" />
          <span className="font-semibold text-[11px]">Quick targets:</span>
          {['https://example.com', 'https://wikipedia.org', 'https://github.com'].map((site) => (
            <button
              key={site}
              type="button"
              onClick={() => handleQuickSelect(site)}
              className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-700 hover:border-slate-400 hover:text-black transition-all font-mono"
            >
              {site.replace('https://', '')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-slate-900" />
          <span>SSRF Shielded</span>
        </div>
      </div>
    </div>
  );
};
