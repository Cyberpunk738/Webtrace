"use client";

import React, { useEffect } from "react";
import { ReportHistory, ReportTools } from "@/components/analysis/ReportTools";
import { useAnalysisStore } from "@/store/analysis-store";
import { Hero } from "@/components/landing/Hero";
import { AnalysisHeader } from "@/components/analysis/AnalysisHeader";
import { ScoreCard } from "@/components/analysis/ScoreCard";
import { MetricCard } from "@/components/analysis/MetricCard";
import { ResourceBreakdown } from "@/components/analysis/ResourceBreakdown";
import { IssuesPanel } from "@/components/analysis/IssuesPanel";
import { Waterfall } from "@/components/waterfall/Waterfall";
import { RequestTable } from "@/components/requests/RequestTable";
import { RequestDrawer } from "@/components/waterfall/RequestDrawer";

import {
  Activity,
  HardDrive,
  Clock,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";
import { formatBytes, formatDuration, formatNumber } from "@/lib/format";

export default function Home() {
  const { status, result, loadHistory } = useAnalysisStore();
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  if (status === "idle") {
    return <Hero />;
  }

  return (
    <div className="dashboard min-h-screen pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <AnalysisHeader />
      </div>

      {status === "complete" && result && (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
          <ReportTools />
          <nav className="report-jump-links" aria-label="Report sections">
            <a href="#overview">Overview ↗</a>
            <a href="#issues">Fix opportunities ↗</a>
            <a href="#waterfall">Waterfall ↗</a>
            <a href="#requests">Requests ↗</a>
          </nav>
          {/* Key Metrics Grid */}
          <div
            id="overview"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6"
          >
            <div className="lg:col-span-2">
              <ScoreCard
                score={result.summary.score}
                category={result.summary.scoreCategory}
              />
            </div>

            <div className="lg:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <MetricCard
                label="Total Requests"
                value={formatNumber(result.summary.requestCount)}
                subtitle="HTTP payloads"
                icon={<Activity className="h-4 w-4 text-sky-400" />}
              />

              <MetricCard
                label="Body Size"
                value={formatBytes(result.summary.totalTransferSize)}
                subtitle={
                  result.capture?.mode === "http"
                    ? "Decoded response bytes"
                    : "Encoded response bytes"
                }
                icon={<HardDrive className="h-4 w-4 text-emerald-400" />}
              />

              <MetricCard
                label="Capture Time"
                value={formatDuration(result.summary.totalDuration)}
                subtitle="Observation window"
                icon={<Clock className="h-4 w-4 text-amber-400" />}
              />

              <MetricCard
                label="Failed Requests"
                value={formatNumber(result.summary.failedRequests)}
                subtitle={
                  result.summary.failedRequests > 0
                    ? "Requires attention"
                    : "All clean"
                }
                icon={<AlertTriangle className="h-4 w-4" />}
                variant={
                  result.summary.failedRequests > 0 ? "danger" : "normal"
                }
              />

              <div className="col-span-2 sm:col-span-4">
                <MetricCard
                  label="Third-Party Dependencies"
                  value={`${result.summary.thirdPartyRequests} requests`}
                  subtitle={`${Math.round((result.summary.thirdPartyRequests / Math.max(1, result.summary.requestCount)) * 100)}% of overall load calls`}
                  icon={<ShieldAlert className="h-4 w-4 text-purple-400" />}
                  variant={
                    result.summary.thirdPartyRequests > 20
                      ? "warning"
                      : "normal"
                  }
                />
              </div>
            </div>
          </div>

          {/* Resource Distribution */}
          <ResourceBreakdown
            resources={result.resources}
            totalRequests={result.summary.requestCount}
          />

          {/* Performance Issues Panel */}
          <IssuesPanel issues={result.issues} />

          {/* Interactive D3 Network Waterfall */}
          <Waterfall
            requests={result.requests}
            totalDuration={result.summary.totalDuration}
          />

          {/* Request Telemetry Table */}
          <RequestTable requests={result.requests} />

          <ReportHistory />
          {/* Slide-out Inspector Drawer */}
          <RequestDrawer requests={result.requests} />
        </div>
      )}
    </div>
  );
}
