'use client';

import React from 'react';
import { ResourceBreakdown as ResourceBreakdownType } from '@/types/analysis';

interface ResourceBreakdownProps {
  resources: ResourceBreakdownType;
  totalRequests: number;
}

export const ResourceBreakdown: React.FC<ResourceBreakdownProps> = ({ resources, totalRequests }) => {
  const categories = [
    { key: 'document', label: 'HTML', count: resources.document, color: 'bg-sky-400' },
    { key: 'scripts', label: 'Scripts', count: resources.scripts, color: 'bg-amber-400' },
    { key: 'stylesheets', label: 'Styles', count: resources.stylesheets, color: 'bg-purple-400' },
    { key: 'images', label: 'Images', count: resources.images, color: 'bg-emerald-400' },
    { key: 'fonts', label: 'Fonts', count: resources.fonts, color: 'bg-indigo-400' },
    { key: 'api', label: 'API (XHR)', count: resources.api, color: 'bg-rose-400' },
    { key: 'other', label: 'Other', count: resources.other, color: 'bg-slate-500' },
  ].filter((c) => c.count > 0);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-mono text-xs font-semibold text-slate-200 uppercase tracking-wider">
          Resource Payload Distribution
        </h3>
        <span className="font-mono text-xs text-slate-400">{totalRequests} Total Requests</span>
      </div>

      {/* Segmented ratio bar */}
      <div className="flex h-3 w-full overflow-hidden rounded-md bg-slate-800">
        {categories.map((c) => {
          const pct = (c.count / totalRequests) * 100;
          return (
            <div
              key={c.key}
              style={{ width: `${pct}%` }}
              className={`h-full ${c.color} transition-all duration-500`}
              title={`${c.label}: ${c.count} (${pct.toFixed(1)}%)`}
            />
          );
        })}
      </div>

      {/* Legend list */}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
        {categories.map((c) => {
          const pct = Math.round((c.count / totalRequests) * 100);
          return (
            <div key={c.key} className="flex items-center gap-1.5 font-mono text-xs">
              <span className={`h-2.5 w-2.5 rounded-sm ${c.color}`} />
              <span className="text-slate-300">{c.label}</span>
              <span className="text-slate-400 font-semibold">{c.count}</span>
              <span className="text-slate-400 text-[10px]">({pct}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
