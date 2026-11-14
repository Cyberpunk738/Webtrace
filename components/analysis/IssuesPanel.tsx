"use client";

import React from "react";
import { PerformanceIssue } from "@/types/issues";
import {
  AlertCircle,
  AlertTriangle,
  Info,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { useAnalysisStore } from "@/store/analysis-store";

interface IssuesPanelProps {
  issues: PerformanceIssue[];
}

export const IssuesPanel: React.FC<IssuesPanelProps> = ({ issues }) => {
  const { setSelectedRequestId } = useAnalysisStore();

  if (issues.length === 0) {
    return (
      <div
        id="issues"
        className="rounded-2xl border border-emerald-300 bg-[#1d3830] p-6 text-center shadow-sm"
      >
        <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-300 mb-2" />
        <h3 className="font-sans text-sm font-bold text-[#f6f3e9]">
          No issues found in captured requests
        </h3>
        <p className="mt-1 text-xs font-mono text-[#bfbbb0]">
          No audit thresholds were exceeded in this capture. This does not
          measure rendering, accessibility or Core Web Vitals.
        </p>
      </div>
    );
  }

  const criticals = issues.filter((i) => i.severity === "critical");
  const warnings = issues.filter((i) => i.severity === "warning");
  const infos = issues.filter((i) => i.severity === "info");

  return (
    <div
      id="issues"
      className="rounded-2xl border border-[#424137] bg-[#252525] p-5 shadow-sm"
    >
      <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-sans text-xs font-bold text-[#f6f3e9] uppercase tracking-wider">
            Fix opportunities
          </h3>
          <span className="rounded-full bg-[#36362f] border border-[#424137] px-2 py-0.5 font-mono text-xs font-bold text-[#f6f3e9]">
            {issues.length}
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          {criticals.length > 0 && (
            <span className="text-rose-300 font-bold">
              {criticals.length} Critical
            </span>
          )}
          {warnings.length > 0 && (
            <span className="text-amber-300 font-bold">
              {warnings.length} Warning
            </span>
          )}
          {infos.length > 0 && (
            <span className="text-sky-300 font-bold">{infos.length} Info</span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {issues.map((issue) => {
          let severityBadge = "bg-[#40232b]/70 border-rose-200 text-rose-200";
          let Icon = AlertCircle;

          if (issue.severity === "warning") {
            severityBadge = "bg-[#3d3420]/70 border-amber-200 text-amber-200";
            Icon = AlertTriangle;
          } else if (issue.severity === "info") {
            severityBadge = "bg-[#22363f]/70 border-sky-200 text-sky-200";
            Icon = Info;
          }

          return (
            <div
              key={issue.id}
              className={`rounded-lg border p-4 transition-all ${severityBadge}`}
            >
              <div className="flex items-start gap-3">
                <Icon className="h-5 w-5 shrink-0 mt-0.5 text-[#f6f3e9]" />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-sans text-xs font-bold text-[#f6f3e9]">
                      {issue.title}
                    </h4>
                    <span className="rounded px-1.5 py-0.5 font-mono text-[10px] font-uppercase tracking-wider border border-[#555247] bg-[#252525] text-[#ece7d8]">
                      {issue.category}
                    </span>
                  </div>

                  <p className="mt-1.5 text-xs text-[#d5d2c8] font-sans leading-relaxed">
                    {issue.description}
                  </p>

                  <div className="mt-2.5 rounded bg-[#252525] p-2.5 border border-[#424137] text-[11px] font-mono shadow-xs">
                    <span className="text-[#f6f3e9] font-bold">
                      Recommendation:{" "}
                    </span>
                    <span className="text-[#d5d2c8]">
                      {issue.recommendation}
                    </span>
                  </div>

                  {issue.affectedRequests &&
                    issue.affectedRequests.length > 0 && (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11px] text-[#bfbbb0]">
                          Affected requests:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {issue.affectedRequests.slice(0, 4).map((reqId) => (
                            <button
                              key={reqId}
                              onClick={() => setSelectedRequestId(reqId)}
                              className="flex items-center gap-1 rounded bg-[#252525] px-2 py-0.5 font-mono text-[10px] text-[#f6f3e9] hover:bg-[#36362f] transition-all border border-[#555247] shadow-xs"
                            >
                              <span>{reqId}</span>
                              <ChevronRight className="h-3 w-3" />
                            </button>
                          ))}
                          {issue.affectedRequests.length > 4 && (
                            <span className="font-mono text-[10px] text-[#aaa69c] self-center">
                              +{issue.affectedRequests.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
