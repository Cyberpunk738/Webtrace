"use client";

import React, { useEffect, useRef } from "react";
import {
  X,
  ExternalLink,
  Clock,
  HardDrive,
  FileText,
  CheckCircle2,
  AlertOctagon,
} from "lucide-react";
import { NetworkRequest } from "@/types/network";
import { formatBytes, formatDuration } from "@/lib/format";
import { useAnalysisStore } from "@/store/analysis-store";

interface RequestDrawerProps {
  requests: NetworkRequest[];
}

export const RequestDrawer: React.FC<RequestDrawerProps> = ({ requests }) => {
  const { selectedRequestId, setSelectedRequestId } = useAnalysisStore();

  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (selectedRequestId && dialog && !dialog.open) dialog.showModal();
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, [selectedRequestId]);

  if (!selectedRequestId) return null;

  const req = requests.find((r) => r.id === selectedRequestId);
  if (!req) return null;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="inspector-title"
      onCancel={() => setSelectedRequestId(null)}
      className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-dvh backdrop:bg-black/60 z-50 flex w-full max-w-lg flex-col border-l border-[#555247] bg-[#252525] p-6 shadow-2xl animate-in slide-in-from-right duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#424137] pb-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-[#f6f3e9]" />
          <h3
            id="inspector-title"
            className="font-sans text-sm font-bold text-[#f6f3e9] uppercase tracking-wider"
          >
            Request Telemetry Inspector
          </h3>
        </div>
        <button
          aria-label="Close request inspector"
          onClick={() => setSelectedRequestId(null)}
          className="rounded-lg p-1.5 text-[#aaa69c] hover:bg-[#36362f] hover:text-[#f9dc59] transition-all"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="mt-4 flex-1 overflow-y-auto space-y-6 pr-1 font-mono text-xs">
        {/* Status Banner */}
        <div className="rounded-xl border border-[#424137] bg-[#2e2e28] p-4">
          <div className="flex items-center justify-between">
            <span className="rounded bg-[#f9dc59] px-2 py-0.5 font-bold text-[#181818] text-[10px]">
              {req.method}
            </span>
            <div className="flex items-center gap-2">
              {req.failed ? (
                <span className="flex items-center gap-1.5 rounded border border-rose-300 bg-[#40232b] px-2 py-0.5 text-rose-300 font-bold">
                  <AlertOctagon className="h-3.5 w-3.5" />
                  FAILED ({req.failureReason || "Error"})
                </span>
              ) : (
                <span className="flex items-center gap-1.5 rounded border border-emerald-300 bg-[#1d3830] px-2 py-0.5 text-emerald-200 font-bold">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {req.status} {req.statusText}
                </span>
              )}
            </div>
          </div>

          <div className="mt-3 overflow-hidden rounded bg-[#252525] p-2.5 border border-[#424137]">
            <span className="text-[#aaa69c] block text-[10px] font-bold">
              Target Resource URL:
            </span>
            <a
              href={req.url}
              target="_blank"
              rel="noreferrer"
              className="mt-1 flex items-center gap-1 text-[#f6f3e9] font-medium hover:underline break-all"
            >
              {req.url}
              <ExternalLink className="h-3 w-3 shrink-0 text-[#aaa69c]" />
            </a>
          </div>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-[#424137] bg-[#2e2e28] p-3">
            <div className="flex items-center gap-1.5 text-[#aaa69c] mb-1">
              <Clock className="h-3.5 w-3.5 text-[#f6f3e9]" />
              <span className="font-sans font-medium">Duration</span>
            </div>
            <span className="text-base font-bold text-[#f6f3e9]">
              {formatDuration(req.duration)}
            </span>
          </div>

          <div className="rounded-lg border border-[#424137] bg-[#2e2e28] p-3">
            <div className="flex items-center gap-1.5 text-[#aaa69c] mb-1">
              <HardDrive className="h-3.5 w-3.5 text-[#f6f3e9]" />
              <span className="font-sans font-medium">Body Size</span>
            </div>
            <span className="text-base font-bold text-[#f6f3e9]">
              {formatBytes(req.transferSize)}
            </span>
          </div>
        </div>

        {/* Technical Attributes */}
        <div className="rounded-lg border border-[#424137] bg-[#2e2e28] p-4 space-y-2.5">
          <h4 className="font-sans font-bold text-[#f6f3e9] uppercase tracking-wider text-[11px]">
            Request Metadata
          </h4>

          <div className="flex justify-between border-b border-[#424137] pb-1.5">
            <span className="text-[#bfbbb0]">Resource Type:</span>
            <span className="text-[#f6f3e9] uppercase font-bold">
              {req.resourceType}
            </span>
          </div>

          <div className="flex justify-between border-b border-[#424137] pb-1.5">
            <span className="text-[#bfbbb0]">Host Domain:</span>
            <span className="text-[#f6f3e9] font-medium">{req.domain}</span>
          </div>

          <div className="flex justify-between border-b border-[#424137] pb-1.5">
            <span className="text-[#bfbbb0]">Third-Party:</span>
            <span
              className={
                req.isThirdParty ? "text-amber-200 font-bold" : "text-[#f6f3e9]"
              }
            >
              {req.isThirdParty ? "Yes (External Domain)" : "No (Same Domain)"}
            </span>
          </div>

          <div className="flex justify-between border-b border-[#424137] pb-1.5">
            <span className="text-[#bfbbb0]">Start Offset:</span>
            <span className="text-[#f6f3e9] font-medium">
              {req.startTime} ms
            </span>
          </div>

          <div className="flex justify-between border-b border-[#424137] pb-1.5">
            <span className="text-[#bfbbb0]">Completion Offset:</span>
            <span className="text-[#f6f3e9] font-medium">{req.endTime} ms</span>
          </div>

          {req.mimeType && (
            <div className="flex justify-between pb-1">
              <span className="text-[#bfbbb0]">MIME Type:</span>
              <span className="text-[#f6f3e9] truncate max-w-[200px] font-medium">
                {req.mimeType}
              </span>
            </div>
          )}
        </div>

        {/* HTTP Response Headers */}
        {req.responseHeaders && Object.keys(req.responseHeaders).length > 0 && (
          <div className="rounded-lg border border-[#424137] bg-[#2e2e28] p-4">
            <h4 className="font-sans font-bold text-[#f6f3e9] uppercase tracking-wider text-[11px] mb-2">
              Response Headers ({Object.keys(req.responseHeaders).length})
            </h4>
            <div className="max-h-48 overflow-y-auto rounded bg-[#252525] p-2.5 border border-[#424137] space-y-1.5">
              {Object.entries(req.responseHeaders).map(([key, val]) => (
                <div key={key} className="break-all text-[11px]">
                  <span className="text-[#f9dc59] font-bold">{key}: </span>
                  <span className="text-[#d5d2c8]">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </dialog>
  );
};
