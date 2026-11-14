"use client";

import React from "react";
import { Search } from "lucide-react";
import { useAnalysisStore, FilterCategory } from "@/store/analysis-store";

export const RequestFilters: React.FC = () => {
  const { filterType, setFilterType, searchQuery, setSearchQuery } =
    useAnalysisStore();

  const categories: { key: FilterCategory; label: string }[] = [
    { key: "all", label: "All" },
    { key: "document", label: "Documents" },
    { key: "script", label: "Scripts" },
    { key: "stylesheet", label: "Styles" },
    { key: "image", label: "Images" },
    { key: "font", label: "Fonts" },
    { key: "xhr", label: "API" },
    { key: "failed", label: "Failed" },
    { key: "third-party", label: "Third-Party" },
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
              aria-pressed={isActive}
              onClick={() => setFilterType(c.key)}
              className={`rounded-md px-3 py-1 font-mono text-xs font-semibold transition-all ${
                isActive
                  ? "bg-[#f9dc59] text-[#181818] shadow-xs"
                  : "bg-[#36362f] text-[#d5d2c8] hover:bg-[#414035] hover:text-[#f9dc59] border border-[#424137]"
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative w-full sm:w-64 shrink-0">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#aaa69c]" />
        <input
          aria-label="Search request URLs or domains"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by name or domain..."
          className="w-full rounded-lg border border-[#555247] bg-[#252525] pl-8 pr-3 py-1.5 font-mono text-xs text-[#f6f3e9] placeholder-slate-400 focus:border-black focus:outline-none shadow-xs"
        />
      </div>
    </div>
  );
};
