'use client';

import React from 'react';
import { NetworkRequest } from '@/types/network';
import { formatBytes, formatDuration } from '@/lib/format';
import { useAnalysisStore } from '@/store/analysis-store';
import { RequestFilters } from './RequestFilters';
import { ArrowUpDown, AlertCircle, ShieldAlert } from 'lucide-react';

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

    if (filterType === 'all') return true;
    if (filterType === 'failed') return r.failed || (r.status && r.status >= 400);
    if (filterType === 'third-party') return r.isThirdParty;
    if (filterType === 'xhr') return r.resourceType === 'xhr' || r.resourceType === 'fetch';

    return r.resourceType === filterType;
  });

  // Sort requests
  filtered.sort((a, b) => {
    let comp = 0;
    if (sortBy === 'name') {
      comp = a.url.localeCompare(b.url);
    } else if (sortBy === 'size') {
      comp = a.transferSize - b.transferSize;
    } else if (sortBy === 'duration') {
      comp = a.duration - b.duration;
    } else if (sortBy === 'status') {
      comp = (a.status || 0) - (b.status || 0);
    }

    return sortOrder === 'desc' ? -comp : comp;
  });

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-mono text-sm font-bold text-slate-100 uppercase tracking-wider">
          Network Request Telemetry Table
        </h3>
        <span className="font-mono text-xs text-slate-400">
          Showing {filtered.length} of {requests.length} requests
        </span>
      </div>

      <RequestFilters />

      <div className="overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full text-left font-mono text-xs">
          <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider">
            <tr>
              <th className="px-3 py-2.5 cursor-pointer hover:text-slate-200" onClick={() => setSorting('name')}>
                <div className="flex items-center gap-1">
                  <span>Name & Method</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="px-3 py-2.5 cursor-pointer hover:text-slate-200" onClick={() => setSorting('status')}>
                <div className="flex items-center gap-1">
                  <span>Status</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="px-3 py-2.5">Type</th>
              <th className="px-3 py-2.5">Domain</th>
              <th className="px-3 py-2.5 cursor-pointer hover:text-slate-200" onClick={() => setSorting('size')}>
                <div className="flex items-center gap-1">
                  <span>Transfer Size</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="px-3 py-2.5 cursor-pointer hover:text-slate-200" onClick={() => setSorting('duration')}>
                <div className="flex items-center gap-1">
                  <span>Time</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No matching network requests found for your active filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map((req, idx) => {
                const isSelected = req.id === selectedRequestId;
                const fileName = req.url.split('/').pop()?.split('?')[0] || req.url;

                let statusBadge = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
                if (req.status && req.status >= 300 && req.status < 400) {
                  statusBadge = 'text-sky-400 bg-sky-500/10 border-sky-500/30';
                } else if (req.failed || (req.status && req.status >= 400)) {
                  statusBadge = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
                }

                return (
                  <tr
                    key={req.id}
                    onClick={() => setSelectedRequestId(req.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-slate-800 text-slate-100 font-semibold'
                        : idx % 2 === 0
                        ? 'bg-slate-900/40 hover:bg-slate-800/50'
                        : 'bg-slate-950/40 hover:bg-slate-800/50'
                    }`}
                  >
                    <td className="px-3 py-2.5 max-w-xs truncate">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300 font-bold">
                          {req.method}
                        </span>
                        <span className="truncate text-slate-200" title={req.url}>
                          {fileName}
                        </span>
                      </div>
                    </td>

                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-bold ${statusBadge}`}>
                        {req.failed ? (
                          <>
                            <AlertCircle className="h-3 w-3 shrink-0" />
                            ERR
                          </>
                        ) : (
                          `${req.status || '200'} ${req.statusText || ''}`
                        )}
                      </span>
                    </td>

                    <td className="px-3 py-2.5 uppercase text-[10px] font-bold text-slate-400">
                      {req.resourceType}
                    </td>

                    <td className="px-3 py-2.5 text-slate-300">
                      <div className="flex items-center gap-1">
                        {req.isThirdParty && <span title="Third-Party Domain"><ShieldAlert className="h-3.5 w-3.5 text-amber-400 shrink-0" /></span>}
                        <span className="truncate max-w-[140px]">{req.domain}</span>
                      </div>
                    </td>

                    <td className="px-3 py-2.5 text-slate-300">
                      {formatBytes(req.transferSize)}
                    </td>

                    <td className="px-3 py-2.5 font-semibold text-slate-200">
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
