# WebTrace

A website network inspector built with Next.js, Playwright, TypeScript and Zustand. Trace a public website, find slow or oversized resources, and compare your next run after making a fix.

## What you can do

- Capture browser requests and inspect their status, duration, encoded body size and response headers.
- Run ten network audit rules, from large JavaScript and images to failed and duplicate requests.
- Explore a scrollable waterfall and searchable, sortable request table with keyboard-accessible request inspection.
- Keep the five most recent reports in browser storage; reopen them after a refresh or clear them at any time.
- Compare a report with the previous saved run of the exact same URL, final destination and capture type.
- Download a JSON report or CSV request list. Headers are excluded from exports and saved reports. CSV cells are escaped to prevent formula execution.

The interface uses a dark grid, condensed display typography, bright yellow/violet/pink cards and playful illustrations. The same palette carries through the loading, error, report and inspector views. It supports mobile layouts and reduced-motion preferences.

## Capture modes and accuracy

**Browser capture** opens Chromium, waits for DOM content, then observes another 1.5 seconds of network activity. Request durations end at body completion rather than response headers. Body sizes come from Playwright's encoded response size. Unfinished requests are reported as failures or pending at the capture boundary. Service workers and WebSockets are blocked for this bounded HTTP inspection.

**Limited HTTP inspection** is used if browser capture cannot run. It fetches the document and up to 30 unique static script, stylesheet and image references with four concurrent workers. It records actual fetch durations, decoded body bytes, status codes and failures. It does not execute JavaScript, parse CSS imports, discover lazy content, or reproduce browser loading order. Each report prominently identifies its capture mode and limitations; no timings, sizes or successful responses are invented.

The score is a deterministic network audit heuristic, not a Lighthouse score, rendering metric or Core Web Vitals measurement. HTTP scores are partial. Capture time describes the observation window; run comparisons can vary with network conditions.

HTTP inspection has an 18-second shared fetch deadline and decoded body limits of 2 MiB for the document and 8 MiB for each resource. Main-document network or size-limit failures return an error. Individual resource failures remain visible in the report.

## Run locally

Use Node.js 20.9 or newer.

```bash
npm ci
npx playwright install chromium
npm run dev
```

Open http://localhost:3000. Production/serverless environments try `@sparticuz/chromium`, with standard Playwright as a fallback.

```bash
npm test
npm run typecheck
npm run build
npm start
```

`npm test` covers the analysis engine plus deterministic tests for fallback measurements, failures, redirect validation, response bounds, exports, comparison matching and stale/canceled requests. It uses mocked network responses and needs no external sites or browser installation.

With the app running, exercise desktop/mobile layouts and report interactions:

```bash
npm run test:browser
npm run test:capture
# Optional for a system Chromium or a different server:
CHROMIUM_PATH=/path/to/chromium TEST_BASE_URL=http://localhost:3000 npm run test:browser
```

The capture test runs real Chromium against a local HTTP fixture to check redirects, delayed body completion, measured bytes, failures, unfinished requests and browser cleanup. Only its launcher and URL guard are injected to permit that trusted local fixture.

The browser smoke test uses a clearly defined fixture for successful reports, tests the real endpoint's rejection of loopback URLs, and writes screenshots into the ignored `test-results/` directory. It checks validation, tabs, failed-request filtering, inspector dismissal, CSV download, repeat-run comparison, persistence, clearing history and horizontal overflow.

## Privacy and deployment

Report history stays in local storage in the current browser. Cookies and other HTTP headers are excluded from saved/exported reports, but request URLs and query parameters remain. Clear saved reports on shared devices. If storage is unavailable or full, a visible notice explains that the report is available only for the current session.

Canceling or starting a replacement run aborts the client fetch and ignores late responses. Cancellation does not terminate an already running server-side capture.

The URL guards reject non-HTTP protocols, embedded credentials, loopback/private/link-local addresses and several special-use ranges. Server DNS checks also apply to browser requests, static resource fetches and HTTP redirect destinations. These checks are defense in depth: deploy the crawler in an isolated environment with outbound private-network access blocked, since DNS checks alone do not pin the actual connection against DNS rebinding. Add authentication/rate limits at the hosting layer before exposing expensive captures broadly.

## Architecture

| Area                              | Responsibility                                                        |
| --------------------------------- | --------------------------------------------------------------------- |
| `app/api/analyze/route.ts`        | Target validation, browser/fallback selection and result assembly     |
| `crawler/`                        | Browser network lifecycle capture and bounded HTTP inspection         |
| `engine/`                         | Normalization, ten audit rules and deterministic scoring              |
| `lib/url.ts`, `lib/safe-fetch.ts` | URL validation, DNS checks and redirect validation                    |
| `lib/reports.ts`                  | Header-free reports, safe CSV and comparison matching                 |
| `store/analysis-store.ts`         | Cancellation, stale-run protection, local history and request filters |
| `components/`                     | Landing, reports, waterfall, request explorer and modal inspector     |

## API

`POST /api/analyze` accepts `{ "url": "https://example.com" }`.

On success it returns `{ "success": true, "result": ... }`. The result includes `summary`, `resources`, `requests`, `issues`, `timing`, and capture metadata:

```json
{
  "capture": {
    "mode": "browser",
    "finalUrl": "https://example.com/",
    "warnings": ["Capture scope and measurement limitations..."]
  }
}
```

Invalid/restricted targets return 400; unreachable fallback targets return 502. The server never substitutes a fabricated successful report for an unreachable document.
