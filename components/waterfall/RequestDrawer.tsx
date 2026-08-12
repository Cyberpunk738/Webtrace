'use client';

import React from 'react';
import { X, ExternalLink, ShieldAlert, Clock, HardDrive, FileText, CheckCircle2, AlertOctagon } from 'lucide-react';
import { NetworkRequest } from '@/types/network';
import { formatBytes, formatDuration } from '@/lib/format';
import { useAnalysisStore } from '@/store/analysis-store';

interface RequestDrawerProps {
  requests: NetworkRequest[];
}

export const RequestDrawer: React.FC<RequestDrawerProps> = ({ requests }) => {
  const { selectedRequestId, setSelectedRequestId } = useAnalysisStore();

  if (!selectedRequestId) return null;

  const req = requests.find((r) => r.id === selectedRequestId);
  if (!req) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-slate-800 bg-[#0b1120] p-6 shadow-2xl backdrop-blur-xl animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-sky-400" />
          <h3 className="font-mono text-sm font-bold text-slate-100 uppercase tracking-wider">
            Request Telemetry Inspector
          </h3>
        </div>
        <button
          onClick={() => setSelectedRequestId(null)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-all"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="mt-4 flex-1 overflow-y-auto space-y-6 pr-1 font-mono text-xs">
        {/* Status Banner */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between">
            <span className="rounded bg-slate-800 px-2 py-0.5 font-bold text-slate-200">{req.method}</span>
            <div className="flex items-center gap-2">
              {req.failed ? (
                <span className="flex items-center gap-1.5 rounded border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-rose-400 font-bold">
                  <AlertOctagon className="h-3.5 w-3.5" />
                  FAILED ({req.failureReason || 'Error'})
                </span>
              ) : (
                <span className="flex items-center gap-1.5 rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-emerald-400 font-bold">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {req.status} {req.statusText}
                </span>
              )}
            </div>
          </div>

          <div className="mt-3 overflow-hidden rounded bg-slate-950 p-2.5 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Target Resource URL:</span>
            <a
              href={req.url}
              target="_blank"
              rel="noreferrer"
              className="mt-1 flex items-center gap-1 text-sky-400 hover:underline break-all"
            >
              {req.url}
              <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          </div>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <Clock className="h-3.5 w-3.5 text-sky-400" />
              <span>Duration</span>
            </div>
            <span className="text-base font-bold text-slate-100">{formatDuration(req.duration)}</span>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="flex items-center gap-1.5 text-slate-400 mb-1">
              <HardDrive className="h-3.5 w-3.5 text-emerald-400" />
              <span>Transfer Size</span>
            </div>
            <span className="text-base font-bold text-slate-100">{formatBytes(req.transferSize)}</span>
          </div>
        </div>

        {/* Technical Attributes */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 space-y-2.5">
          <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Request Metadata</h4>

          <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
            <span className="text-slate-400">Resource Type:</span>
            <span className="text-slate-200 uppercase font-bold">{req.resourceType}</span>
          </div>

          <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
            <span className="text-slate-400">Host Domain:</span>
            <span className="text-slate-200">{req.domain}</span>
          </div>

          <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
            <span className="text-slate-400">Third-Party:</span>
            <span className={req.isThirdParty ? 'text-amber-400 font-bold' : 'text-slate-300'}>
              {req.isThirdParty ? 'Yes (External Domain)' : 'No (Same Domain)'}
            </span>
          </div>

          <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
            <span className="text-slate-400">Start Offset:</span>
            <span className="text-slate-200">{req.startTime} ms</span>
          </div>

          <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
            <span className="text-slate-400">Completion Offset:</span>
            <span className="text-slate-200">{req.endTime} ms</span>
          </div>

          {req.mimeType && (
            <div className="flex justify-between pb-1">
              <span className="text-slate-400">MIME Type:</span>
              <span className="text-slate-200 truncate max-w-[200px]">{req.mimeType}</span>
            </div>
          )}
        </div>

        {/* HTTP Response Headers */}
        {req.responseHeaders && Object.keys(req.responseHeaders).length > 0 && (
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-2">
              Response Headers ({Object.keys(req.responseHeaders).length})
            </h4>
            <div className="max-h-48 overflow-y-auto rounded bg-slate-950 p-2.5 border border-slate-800 space-y-1.5">
              {Object.entries(req.responseHeaders).map(([key, val]) => (
                <div key={key} className="break-all text-[11px]">
                  <span className="text-sky-400 font-semibold">{key}: </span>
                  <span className="text-slate-300">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
