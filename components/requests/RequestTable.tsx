"use client";

import React from "react";
import { NetworkRequest } from "@/types/network";
import { formatBytes, formatDuration } from "@/lib/format";
import { useAnalysisStore } from "@/store/analysis-store";
import { RequestFilters } from "./RequestFilters";
import { ArrowUpDown, AlertCircle, ShieldAlert } from "lucide-react";

interface RequestTableProps {
  requests: NetworkRequest[];
}

export const RequestTable: React.FC<RequestTableProps> = ({ requests }) => {
  const {
    filterType,
    searchQuery,
    sortBy,
    sortOrder,
    setSorting,
    selectedRequestId,
    setSelectedRequestId,
  } = useAnalysisStore();

  // Filter requests
  let filtered = requests.filter((r) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchUrl = r.url.toLowerCase().includes(q);
      const matchDomain = r.domain.toLowerCase().includes(q);
      if (!matchUrl && !matchDomain) return false;
    }

    if (filterType === "all") return true;
    if (filterType === "failed")
      return r.failed || (r.status && r.status >= 400);
    if (filterType === "third-party") return r.isThirdParty;
    if (filterType === "xhr")
      return r.resourceType === "xhr" || r.resourceType === "fetch";

    return r.resourceType === filterType;
  });

  // Sort requests
  filtered.sort((a, b) => {
    let comp = 0;
    if (sortBy === "name") {
      comp = a.url.localeCompare(b.url);
    } else if (sortBy === "size") {
      comp = a.transferSize - b.transferSize;
    } else if (sortBy === "duration") {
      comp = a.duration - b.duration;
    } else if (sortBy === "status") {
      comp = (a.status || 0) - (b.status || 0);
    }

    return sortOrder === "desc" ? -comp : comp;
  });

  return (
    <div
      id="requests"
      className="rounded-xl border border-[#424137] bg-[#252525] p-5 shadow-sm"
    >
      <div className="flex flex-wrap gap-2 items-center justify-between mb-3">
        <h3 className="font-sans text-xs font-bold text-[#f6f3e9] uppercase tracking-wider">
          Request explorer
        </h3>
        <span className="font-mono text-xs text-[#aaa69c] font-medium">
          Showing {filtered.length} of {requests.length} requests
        </span>
      </div>

      <RequestFilters />

      <div className="overflow-x-auto rounded-lg border border-[#424137]">
        <table className="w-full text-left font-mono text-xs">
          <thead className="bg-[#2e2e28] text-[#d5d2c8] border-b border-[#424137] uppercase tracking-wider">
            <tr>
              <th
                scope="col"
                aria-sort={
                  sortBy === "name"
                    ? sortOrder === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
                className="px-3.5 py-2.5 cursor-pointer hover:text-[#f9dc59]"
              >
                <button
                  onClick={() => setSorting("name")}
                  className="flex items-center gap-1 font-bold"
                >
                  <span>Name & Method</span>
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th
                scope="col"
                aria-sort={
                  sortBy === "status"
                    ? sortOrder === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
                className="px-3.5 py-2.5 cursor-pointer hover:text-[#f9dc59]"
              >
                <button
                  onClick={() => setSorting("status")}
                  className="flex items-center gap-1 font-bold"
                >
                  <span>Status</span>
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th scope="col" className="px-3.5 py-2.5 font-bold">
                Type
              </th>
              <th scope="col" className="px-3.5 py-2.5 font-bold">
                Domain
              </th>
              <th
                scope="col"
                aria-sort={
                  sortBy === "size"
                    ? sortOrder === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
                className="px-3.5 py-2.5 cursor-pointer hover:text-[#f9dc59]"
              >
                <button
                  onClick={() => setSorting("size")}
                  className="flex items-center gap-1 font-bold"
                >
                  <span>Body Size</span>
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th
                scope="col"
                aria-sort={
                  sortBy === "duration"
                    ? sortOrder === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
                className="px-3.5 py-2.5 cursor-pointer hover:text-[#f9dc59]"
              >
                <button
                  onClick={() => setSorting("duration")}
                  className="flex items-center gap-1 font-bold"
                >
                  <span>Time</span>
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#424137]">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-[#aaa69c] font-sans"
                >
                  No matching network requests found for your active filter
                  criteria.
                </td>
              </tr>
            ) : (
              filtered.map((req, idx) => {
                const isSelected = req.id === selectedRequestId;
                const fileName =
                  req.url.split("/").pop()?.split("?")[0] || req.url;

                let statusBadge =
                  "text-emerald-300 bg-[#1d3830] border-emerald-300";
                if (req.status && req.status >= 300 && req.status < 400) {
                  statusBadge = "text-sky-300 bg-[#22363f] border-sky-300";
                } else if (req.failed || (req.status && req.status >= 400)) {
                  statusBadge = "text-rose-300 bg-[#40232b] border-rose-300";
                }

                return (
                  <tr
                    key={req.id}
                    onClick={() => setSelectedRequestId(req.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-[#36362f] text-[#f9dc59] font-semibold"
                        : idx % 2 === 0
                          ? "bg-[#252525] hover:bg-[#2e2e28]"
                          : "bg-[#2e2e28]/50 hover:bg-[#36362f]"
                    }`}
                  >
                    <td className="px-3.5 py-2.5 max-w-xs truncate">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-[#414035] px-1.5 py-0.5 text-[10px] text-[#f6f3e9] font-bold">
                          {req.method}
                        </span>
                        <button
                          onClick={() => setSelectedRequestId(req.id)}
                          aria-label={`Inspect ${req.url}`}
                          className="truncate text-left text-[#f6f3e9] font-medium"
                          title={req.url}
                        >
                          {fileName}
                        </button>
                      </div>
                    </td>

                    <td className="px-3.5 py-2.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-bold ${statusBadge}`}
                      >
                        {req.failed ? (
                          <>
                            <AlertCircle className="h-3 w-3 shrink-0" />
                            {req.status || "ERR"}
                          </>
                        ) : (
                          `${req.status ?? "Pending"} ${req.statusText || ""}`
                        )}
                      </span>
                    </td>

                    <td className="px-3.5 py-2.5 uppercase text-[10px] font-bold text-[#bfbbb0]">
                      {req.resourceType}
                    </td>

                    <td className="px-3.5 py-2.5 text-[#d5d2c8]">
                      <div className="flex items-center gap-1">
                        {req.isThirdParty && (
                          <span title="Third-Party Domain">
                            <ShieldAlert className="h-3.5 w-3.5 text-amber-300 shrink-0" />
                          </span>
                        )}
                        <span className="truncate max-w-[140px]">
                          {req.domain}
                        </span>
                      </div>
                    </td>

                    <td className="px-3.5 py-2.5 text-[#d5d2c8] font-medium">
                      {formatBytes(req.transferSize)}
                    </td>

                    <td className="px-3.5 py-2.5 font-bold text-[#f6f3e9]">
                      {formatDuration(req.duration)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
