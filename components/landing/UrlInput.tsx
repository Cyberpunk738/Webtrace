"use client";
import { useState } from "react";
import { ArrowUpRight, Globe2 } from "lucide-react";
import { validateAndNormalizeUrl } from "@/lib/url";
import { useAnalysisStore } from "@/store/analysis-store";

export function UrlInput() {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { startAnalysis } = useAnalysisStore();
  return (
    <div className="url-input-wrap">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const checked = validateAndNormalizeUrl(input);
          if (!checked.valid || !checked.normalizedUrl) {
            setError(checked.error || "Enter a public website URL.");
            return;
          }
          void startAnalysis(checked.normalizedUrl);
        }}
      >
        <label htmlFor="target-url" className="sr-only">
          Public website URL
        </label>
        <div className="url-form">
          <Globe2 size={21} aria-hidden="true" />
          <input
            id="target-url"
            type="text"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(null);
            }}
            placeholder="Enter a website, e.g. example.com"
            aria-invalid={!!error}
            aria-describedby={error ? "url-error" : undefined}
          />
          <button type="submit" disabled={!input.trim()}>
            Trace website <ArrowUpRight size={18} />
          </button>
        </div>
        {error && (
          <p className="input-error" id="url-error" role="alert">
            {error}
          </p>
        )}
      </form>
      <div className="try-targets">
        <span>TRY IT WITH</span>
        {["example.com", "wikipedia.org", "github.com"].map((site) => (
          <button
            key={site}
            onClick={() => {
              setInput(site);
              setError(null);
              document.getElementById("target-url")?.focus();
            }}
          >
            {site} ↗
          </button>
        ))}
      </div>
    </div>
  );
}
