'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { useAnalysisStore, FilterCategory } from '@/store/analysis-store';

export const RequestFilters: React.FC = () => {
  const { filterType, setFilterType, searchQuery, setSearchQuery } = useAnalysisStore();

  const categories: { key: FilterCategory; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'document', label: 'Documents' },
    { key: 'script', label: 'Scripts' },
    { key: 'stylesheet', label: 'Styles' },
    { key: 'image', label: 'Images' },
    { key: 'font', label: 'Fonts' },
    { key: 'xhr', label: 'API' },
    { key: 'failed', label: 'Failed' },
    { key: 'third-party', label: 'Third-Party' },
  ];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
      {/* Category Pills */}
      <div className="flex flex-wrap gap-1.5 overflow-x-auto py-1">
        {categories.map((c) => {
          const isActive = filterType === c.key;
          return (
            <button
              key={c.key}
              onClick={() => setFilterType(c.key)}
              className={`rounded-md px-2.5 py-1 font-mono text-xs font-medium transition-all ${
                isActive
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by name or domain..."
          className="w-full rounded-lg border border-slate-800 bg-slate-950 pl-8 pr-3 py-1.5 font-mono text-xs text-slate-200 placeholder-slate-500 focus:border-sky-500 focus:outline-none"
        />
      </div>
    </div>
  );
};
