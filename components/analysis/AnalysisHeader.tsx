"use client";
import { useAnalysisStore } from "@/store/analysis-store";
import {
  ArrowLeft,
  ArrowUpRight,
  Loader2,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";

export function AnalysisHeader() {
  const { url, status, error, result, reset, startAnalysis } =
    useAnalysisStore();
  if (status === "analyzing" || status === "error")
    return (
      <div className="status-wrap">
        <section
          className="status-card"
          aria-live="polite"
          aria-busy={status === "analyzing"}
        >
          {status === "analyzing" ? (
            <Loader2 className="status-icon animate-spin" />
          ) : (
            <TriangleAlert className="status-icon" />
          )}
          <span className="eyebrow">
            {status === "analyzing"
              ? "FOLLOWING THE REQUESTS"
              : "SOMETHING GOT IN THE WAY"}
          </span>
          <h1 className="display">
            {status === "analyzing" ? "ON THE TRACE." : "LET’S TRY AGAIN."}
          </h1>
          <p className="status-url">{url}</p>
          <p>
            {status === "analyzing"
              ? "Collecting network activity and evaluating audit rules. This usually takes a few seconds; some websites take longer."
              : error}
          </p>
          <div className="status-actions">
            {status === "error" && (
              <button
                className="primary-button"
                onClick={() => startAnalysis(url)}
              >
                Retry analysis <RefreshCw size={16} />
              </button>
            )}
            <button className="secondary-button" onClick={reset}>
              {status === "analyzing"
                ? "Cancel analysis"
                : "Choose another website"}{" "}
              <ArrowLeft size={16} />
            </button>
          </div>
          {status === "analyzing" && (
            <small>
              Canceling stops waiting for the report. The server capture may
              finish in the background.
            </small>
          )}
        </section>
      </div>
    );
  if (!result) return null;
  return (
    <div className="report-heading">
      <div>
        <span className="eyebrow">YOUR WEBSITE, UNDER THE HOOD</span>
        <h1 className="display">
          THE TRACE <span className="yellow-text">IS IN.</span>
        </h1>
        <a
          href={result.url}
          target="_blank"
          rel="noreferrer"
          className="report-url"
        >
          {result.url} <ArrowUpRight size={16} />
        </a>
        <p className="report-date">
          {new Date(result.timestamp).toLocaleString()}
        </p>
      </div>
      <button
        className="primary-button"
        onClick={() => startAnalysis(result.url)}
      >
        Run again <RefreshCw size={16} />
      </button>
    </div>
  );
}
