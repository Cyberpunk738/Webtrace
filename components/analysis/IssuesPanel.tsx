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
      <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-6 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600 mb-2" />
        <h3 className="font-sans text-sm font-bold text-slate-900">No Critical Performance Bottlenecks Found</h3>
        <p className="mt-1 text-xs font-mono text-slate-600">
          Network activity adheres to optimal resource size and timing guidelines.
        </p>
      </div>
    );
  }

  const criticals = issues.filter((i) => i.severity === 'critical');
  const warnings = issues.filter((i) => i.severity === 'warning');
  const infos = issues.filter((i) => i.severity === 'info');

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-sans text-xs font-bold text-slate-900 uppercase tracking-wider">
            Performance Bottlenecks & Audit Rules
          </h3>
          <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 font-mono text-xs font-bold text-slate-900">
            {issues.length}
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          {criticals.length > 0 && (
            <span className="text-rose-600 font-bold">{criticals.length} Critical</span>
          )}
          {warnings.length > 0 && (
            <span className="text-amber-600 font-bold">{warnings.length} Warning</span>
          )}
          {infos.length > 0 && <span className="text-sky-600 font-bold">{infos.length} Info</span>}
        </div>
      </div>

      <div className="space-y-3">
        {issues.map((issue) => {
          let severityBadge = 'bg-rose-50/70 border-rose-200 text-rose-900';
          let Icon = AlertCircle;

          if (issue.severity === 'warning') {
            severityBadge = 'bg-amber-50/70 border-amber-200 text-amber-900';
            Icon = AlertTriangle;
          } else if (issue.severity === 'info') {
            severityBadge = 'bg-sky-50/70 border-sky-200 text-sky-900';
            Icon = Info;
          }

          return (
            <div
              key={issue.id}
              className={`rounded-lg border p-4 transition-all ${severityBadge}`}
            >
              <div className="flex items-start gap-3">
                <Icon className="h-5 w-5 shrink-0 mt-0.5 text-slate-900" />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-sans text-xs font-bold text-slate-900">{issue.title}</h4>
                    <span className="rounded px-1.5 py-0.5 font-mono text-[10px] font-uppercase tracking-wider border border-slate-300 bg-white text-slate-800">
                      {issue.category}
                    </span>
                  </div>

                  <p className="mt-1.5 text-xs text-slate-700 font-sans leading-relaxed">{issue.description}</p>

                  <div className="mt-2.5 rounded bg-white p-2.5 border border-slate-200 text-[11px] font-mono shadow-xs">
                    <span className="text-slate-900 font-bold">Recommendation: </span>
                    <span className="text-slate-700">{issue.recommendation}</span>
                  </div>

                  {issue.affectedRequests && issue.affectedRequests.length > 0 && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="font-mono text-[11px] text-slate-600">Affected requests:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {issue.affectedRequests.slice(0, 4).map((reqId) => (
                          <button
                            key={reqId}
                            onClick={() => setSelectedRequestId(reqId)}
                            className="flex items-center gap-1 rounded bg-white px-2 py-0.5 font-mono text-[10px] text-slate-900 hover:bg-slate-100 transition-all border border-slate-300 shadow-xs"
                          >
                            <span>{reqId}</span>
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        ))}
                        {issue.affectedRequests.length > 4 && (
                          <span className="font-mono text-[10px] text-slate-500 self-center">
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
