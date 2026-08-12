'use client';

import React from 'react';
import { PerformanceIssue } from '@/types/issues';
import { AlertCircle, AlertTriangle, Info, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useAnalysisStore } from '@/store/analysis-store';

interface IssuesPanelProps {
  issues: PerformanceIssue[];
}

export const IssuesPanel: React.FC<IssuesPanelProps> = ({ issues }) => {
  const { setSelectedRequestId } = useAnalysisStore();

  if (issues.length === 0) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400 mb-2" />
        <h3 className="font-mono text-sm font-bold text-slate-200">No Critical Performance Bottlenecks Found</h3>
        <p className="mt-1 text-xs font-mono text-slate-400">
          Network activity adheres to optimal resource size and timing guidelines.
        </p>
      </div>
    );
  }

  const criticals = issues.filter((i) => i.severity === 'critical');
  const warnings = issues.filter((i) => i.severity === 'warning');
  const infos = issues.filter((i) => i.severity === 'info');

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-mono text-sm font-bold text-slate-100 uppercase tracking-wider">
            Performance Bottlenecks & Audit Rules
          </h3>
          <span className="rounded-full bg-slate-800 px-2 py-0.5 font-mono text-xs font-bold text-slate-300">
            {issues.length}
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          {criticals.length > 0 && (
            <span className="text-rose-400 font-semibold">{criticals.length} Critical</span>
          )}
          {warnings.length > 0 && (
            <span className="text-amber-400 font-semibold">{warnings.length} Warning</span>
          )}
          {infos.length > 0 && <span className="text-sky-400 font-semibold">{infos.length} Info</span>}
        </div>
      </div>

      <div className="space-y-3">
        {issues.map((issue) => {
          let severityBadge = 'bg-rose-500/10 border-rose-500/30 text-rose-400';
          let Icon = AlertCircle;

          if (issue.severity === 'warning') {
            severityBadge = 'bg-amber-500/10 border-amber-500/30 text-amber-400';
            Icon = AlertTriangle;
          } else if (issue.severity === 'info') {
            severityBadge = 'bg-sky-500/10 border-sky-500/30 text-sky-400';
            Icon = Info;
          }

          return (
            <div
              key={issue.id}
              className={`rounded-lg border p-4 transition-all ${severityBadge}`}
            >
              <div className="flex items-start gap-3">
                <Icon className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-mono text-xs font-bold text-slate-100">{issue.title}</h4>
                    <span className="rounded px-1.5 py-0.5 font-mono text-[10px] font-uppercase tracking-wider border border-current opacity-80">
                      {issue.category}
                    </span>
                  </div>

                  <p className="mt-1.5 text-xs text-slate-300">{issue.description}</p>

                  <div className="mt-2.5 rounded bg-slate-950/60 p-2.5 border border-slate-800 text-[11px] font-mono">
                    <span className="text-slate-400 font-semibold">Recommendation: </span>
                    <span className="text-slate-200">{issue.recommendation}</span>
                  </div>

                  {issue.affectedRequests && issue.affectedRequests.length > 0 && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="font-mono text-[11px] text-slate-400">Affected requests:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {issue.affectedRequests.slice(0, 4).map((reqId) => (
                          <button
                            key={reqId}
                            onClick={() => setSelectedRequestId(reqId)}
                            className="flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-sky-400 hover:bg-slate-700 hover:text-sky-300 transition-all border border-slate-700"
                          >
                            <span>{reqId}</span>
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        ))}
                        {issue.affectedRequests.length > 4 && (
                          <span className="font-mono text-[10px] text-slate-400 self-center">
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
