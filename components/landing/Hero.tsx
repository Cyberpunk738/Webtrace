'use client';

import React from 'react';
import Image from 'next/image';
import { UrlInput } from './UrlInput';
import { Network, Cpu, ShieldCheck, BarChart2 } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-[calc(100vh-73px)] flex flex-col justify-between bg-white text-slate-900 overflow-hidden">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />

      {/* Main Split Hero Container */}
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column - Content & Action */}
        <div className="lg:col-span-7 space-y-8 py-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1 text-[11px] font-mono font-medium text-slate-700 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-900 animate-pulse" />
            <span>✦ SYNCING REAL-TIME BROWSER TELEMETRY</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.06]">
              The pipeline <br />
              that runs itself
            </h1>

            <p className="max-w-xl text-base sm:text-lg text-slate-600 font-sans leading-relaxed">
              WebTrace loads any website in a real Chromium browser, captures 100% of network activity, normalizes request telemetry, and identifies exact performance bottlenecks — real time, zero guesswork.
            </p>
          </div>

          {/* Action Form */}
          <div className="pt-2">
            <UrlInput />
          </div>
        </div>

        {/* Right Column - 3D Visual Asset (Mobius White Theme Sculpture Display) */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          <div className="relative w-full aspect-square max-w-md mx-auto rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-2xl overflow-hidden group">
            {/* Tech Grid Corners */}
            <div className="absolute top-3 left-3 text-[9px] font-mono text-slate-400 z-10 uppercase tracking-wider">
              SYS::PLAYWRIGHT_ENGINE
            </div>
            <div className="absolute bottom-3 right-3 text-[9px] font-mono text-slate-400 z-10 uppercase tracking-wider">
              SUB_MS_PRECISION
            </div>

            <div className="relative w-full h-full rounded-xl overflow-hidden bg-white flex items-center justify-center border border-slate-200">
              <Image
                src="/hero-3d-white.png"
                alt="WebTrace 3D Telemetry Network Sculpture"
                fill
                priority
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              {/* Status Badge Tag */}
              <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 rounded-lg border border-slate-200 bg-white/90 px-3 py-1.5 backdrop-blur-md shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="font-mono text-xs font-bold text-slate-900">10 Audit Rules Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobius-Style Hairline Border 4-Column Feature Grid (Bottom of Hero) */}
      <div id="platform" className="relative border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
          <div className="p-6 sm:p-8 space-y-2">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <Network className="h-5 w-5 text-slate-900" />
              <span className="font-mono text-[10px] text-slate-400">01</span>
            </div>
            <h3 className="font-sans text-sm font-bold text-slate-900">Real-time Telemetry</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Capture 100% of HTTP status codes, exact durations, headers, and transfer sizes via Playwright.
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-2">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <Cpu className="h-5 w-5 text-slate-900" />
              <span className="font-mono text-[10px] text-slate-400">02</span>
            </div>
            <h3 className="font-sans text-sm font-bold text-slate-900">10 Audit Rules</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every request analyzed for heavy JS/CSS bundles, unoptimized images, API lag, and 3rd party bloat.
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-2">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <BarChart2 className="h-5 w-5 text-slate-900" />
              <span className="font-mono text-[10px] text-slate-400">03</span>
            </div>
            <h3 className="font-sans text-sm font-bold text-slate-900">D3 Gantt Waterfall</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Interactive timeline visualization mapping asset loading sequence and timing bottlenecks.
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-2">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <ShieldCheck className="h-5 w-5 text-slate-900" />
              <span className="font-mono text-[10px] text-slate-400">04</span>
            </div>
            <h3 className="font-sans text-sm font-bold text-slate-900">SSRF Protected</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Strict protocol enforcement and private IP blocklists ensuring zero intranet security vulnerability.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
