"use client";
import { Activity, ArrowUpRight } from "lucide-react";
import { useAnalysisStore } from "@/store/analysis-store";

export function Header() {
  const { reset, status } = useAnalysisStore();
  return (
    <header className="site-header">
      <div className="site-nav">
        <button className="brand" onClick={reset} aria-label="WebTrace home">
          <span className="brand-symbol">
            <Activity size={22} />
          </span>{" "}
          WEBTRACE<span className="brand-dot">®</span>
        </button>
        <div className="nav-caption">LESS GUESSWORK. MORE SPEED.</div>
        <button
          className="nav-action"
          onClick={() => {
            if (status !== "idle") reset();
            else document.getElementById("target-url")?.focus();
          }}
        >
          {status === "analyzing"
            ? "Cancel analysis"
            : status === "complete"
              ? "New analysis"
              : "Trace a website"}
          <ArrowUpRight size={16} />
        </button>
      </div>
    </header>
  );
}
