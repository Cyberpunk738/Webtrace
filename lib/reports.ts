import { AnalysisResult } from "../types/analysis";

export const HISTORY_KEY = "webtrace-reports-v1";
export const MAX_REPORTS = 5;

// Headers may contain cookies or tokens; never persist/export them by default.
export function portableReport(result: AnalysisResult): AnalysisResult {
  return {
    ...result,
    requests: result.requests.map(
      ({ requestHeaders, responseHeaders, ...request }) => request,
    ),
  };
}

export function requestCsv(result: AnalysisResult): string {
  const cell = (value: unknown) => {
    let text = String(value ?? "");
    // Avoid spreadsheet formula execution when opening an untrusted URL or header value.
    if (/^[=+@\-\t\r]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  };
  return [
    [
      "URL",
      "Method",
      "Status",
      "Type",
      "Duration (ms)",
      "Body bytes",
      "Failed",
      "Third party",
    ],
    ...result.requests.map((r) => [
      r.url,
      r.method,
      r.status,
      r.resourceType,
      r.duration,
      r.transferSize,
      !!r.failed,
      !!r.isThirdParty,
    ]),
  ]
    .map((row) => row.map(cell).join(","))
    .join("\r\n");
}

export function previousComparable(
  result: AnalysisResult,
  history: AnalysisResult[],
): AnalysisResult | undefined {
  return history.find(
    (item) =>
      item.timestamp !== result.timestamp &&
      item.url === result.url &&
      item.capture?.mode === result.capture?.mode &&
      item.capture?.finalUrl === result.capture?.finalUrl,
  );
}
