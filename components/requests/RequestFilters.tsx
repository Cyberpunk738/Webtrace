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
              className={`rounded-md px-3 py-1 font-mono text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-black border border-slate-200'
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
          className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-1.5 font-mono text-xs text-slate-900 placeholder-slate-400 focus:border-black focus:outline-none shadow-xs"
        />
      </div>
    </div>
  );
};
