'use client';

import React from 'react';
import { UrlInput } from './UrlInput';
import { Network, Zap, Cpu, BarChart3 } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3.5 py-1 text-xs font-mono font-medium text-sky-400 mb-6">
          <Zap className="h-3.5 w-3.5" />
          <span>Real Browser Automation & Telemetry</span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 sm:text-5xl lg:text-6xl">
          Understand what&apos;s slowing down your website.
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base text-slate-400 sm:text-lg">
          WebTrace captures real browser network activity, normalizes request telemetry, and identifies exact performance bottlenecks with deterministic engineering rules.
        </p>

        <div className="mt-10">
          <UrlInput />
        </div>

        {/* Product Capabilities Pillars */}
        <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-left">
            <Network className="h-5 w-5 text-sky-400 mb-2" />
            <h3 className="font-mono text-xs font-semibold text-slate-200">Network Intelligence</h3>
            <p className="mt-1 text-[11px] text-slate-400">Capture 100% of HTTP requests, status codes, and exact durations.</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-left">
            <BarChart3 className="h-5 w-5 text-amber-400 mb-2" />
            <h3 className="font-mono text-xs font-semibold text-slate-200">D3 Waterfall Timeline</h3>
            <p className="mt-1 text-[11px] text-slate-400">Interactive Gantt-style timeline visualization of asset loading sequence.</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-left">
            <Cpu className="h-5 w-5 text-emerald-400 mb-2" />
            <h3 className="font-mono text-xs font-semibold text-slate-200">Deterministic Engine</h3>
            <p className="mt-1 text-[11px] text-slate-400">Zero AI guesswork. Exact rule metrics for JS, CSS, images, and API lag.</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-left">
            <Cpu className="h-5 w-5 text-purple-400 mb-2" />
            <h3 className="font-mono text-xs font-semibold text-slate-200">Request Inspector</h3>
            <p className="mt-1 text-[11px] text-slate-400">Click any request to inspect HTTP headers, status codes, and transfer payload details.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
