"use client";
import { useAnalysisStore } from "@/store/analysis-store";
import { portableReport, previousComparable, requestCsv } from "@/lib/reports";
import { Download, History, ArrowUpRight, Trash2 } from "lucide-react";
import { formatBytes, formatDuration } from "@/lib/format";

export function ReportHistory() {
  const { history, openReport, clearHistory, storageNotice } =
    useAnalysisStore();
  if (!history.length && !storageNotice) return null;
  return (
    <section className="report-history">
      <div className="history-heading">
        <h2>
          <History size={18} /> Recent traces <span>{history.length}/5</span>
        </h2>
        {history.length > 0 && (
          <button className="text-button" onClick={clearHistory}>
            <Trash2 size={14} /> Clear saved reports
          </button>
        )}
      </div>
      <p className="history-note">
        Saved in this browser. Headers are excluded. URLs may contain query
        parameters; clear reports on shared devices.
      </p>
      {storageNotice && (
        <p role="status" className="history-note">
          {storageNotice}
        </p>
      )}
      <div className="history-list">
        {history.map((report, index) => (
          <button
            key={`${report.timestamp}-${index}`}
            onClick={() => openReport(report)}
          >
            <span className="history-score">{report.summary.score}</span>
            <span className="history-info">
              <strong>{report.domain}</strong>
              <span>{report.url}</span>
              <small>
                {new Date(report.timestamp).toLocaleString()} ·{" "}
                {report.capture?.mode === "http"
                  ? "HTTP inspection"
                  : "Browser capture"}
              </small>
            </span>
            <ArrowUpRight size={18} />
          </button>
        ))}
      </div>
    </section>
  );
}

function download(contents: string, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function ReportTools() {
  const { result, history, storageNotice } = useAnalysisStore();
  if (!result) return null;
  const previous = previousComparable(result, history);
  const prefix = `webtrace-${result.domain.replace(/[^a-z0-9.-]/gi, "_")}-${result.timestamp.replace(/[:.]/g, "-")}`;
  const delta = (
    value: number,
    before: number,
    format: (n: number) => string,
  ) =>
    `${value > before ? "+" : value < before ? "−" : ""}${format(Math.abs(value - before))}`;
  return (
    <>
      <div className="report-tools">
        <div>
          <span
            className={`capture-pill ${result.capture?.mode === "http" ? "limited" : ""}`}
          >
            {result.capture?.mode === "http"
              ? "LIMITED HTTP INSPECTION"
              : "BROWSER CAPTURE"}
          </span>
          <p>
            {result.capture?.mode === "http"
              ? "Partial audit score · server fetch timings"
              : "Network audit score · bounded observation window"}
          </p>
        </div>
        <div className="export-actions">
          <button
            className="secondary-button"
            onClick={() =>
              download(
                JSON.stringify(portableReport(result), null, 2),
                `${prefix}.json`,
                "application/json",
              )
            }
          >
            <Download size={15} /> Report JSON
          </button>
          <button
            className="secondary-button"
            onClick={() =>
              download(
                requestCsv(result),
                `${prefix}.csv`,
                "text/csv;charset=utf-8",
              )
            }
          >
            <Download size={15} /> Requests CSV
          </button>
        </div>
      </div>
      {!!result.capture?.warnings.length && (
        <aside className="capture-notice">
          {result.capture.warnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
          {result.capture.finalUrl !== result.url && (
            <p>
              Final destination:{" "}
              <span className="break-all">{result.capture.finalUrl}</span>
            </p>
          )}
        </aside>
      )}
      {storageNotice && (
        <p role="status" className="capture-notice">
          {storageNotice}
        </p>
      )}
      {previous ? (
        <section className="comparison">
          <div>
            <span className="eyebrow">VERSUS PREVIOUS TRACE</span>
            <p>
              {new Date(previous.timestamp).toLocaleString()} · Same URL &
              capture type. Network conditions can vary.
            </p>
          </div>
          <div className="comparison-metrics">
            {[
              [
                "Score",
                delta(result.summary.score, previous.summary.score, String),
              ],
              [
                "Body bytes",
                delta(
                  result.summary.totalTransferSize,
                  previous.summary.totalTransferSize,
                  formatBytes,
                ),
              ],
              [
                "Capture time",
                delta(
                  result.summary.totalDuration,
                  previous.summary.totalDuration,
                  formatDuration,
                ),
              ],
              [
                "Requests",
                delta(
                  result.summary.requestCount,
                  previous.summary.requestCount,
                  String,
                ),
              ],
            ].map(([label, value]) => (
              <div key={label}>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <p className="comparison-empty">
          Run this URL again to compare with a previous trace of the same
          capture type.
        </p>
      )}
    </>
  );
}
