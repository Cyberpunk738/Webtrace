# WebTrace — Website Performance Intelligence Engine

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-Chromium-green?style=flat-square&logo=playwright)](https://playwright.dev/)
[![D3.js](https://img.shields.io/badge/D3.js-v7-orange?style=flat-square&logo=d3.js)](https://d3js.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

WebTrace is a developer-centric performance analysis engine designed to capture, profile, and audit web application network activity. Unlike synthetic Lighthouse scores or simulated benchmarks, WebTrace instrumentally loads public web applications inside a headless Chromium browser using Playwright, intercepts 100% of network payloads, normalizes raw network telemetry, and evaluates performance bottlenecks against a deterministic engineering rule engine.

---

## 🏗️ Core Architecture

The application is structured into decoupled modules: Browser Automation, Data Normalization, Rule Engine, Global State Management, and Data Visualization.

```text
┌─────────────────┐     ┌──────────────────────┐     ┌────────────────────────┐
│  Target Website │ ──> │ Playwright Chromium  │ ──> │ Raw Captured Network   │
│      (URL)      │     │ Event Interception   │     │ Payloads & Timings     │
└─────────────────┘     └──────────────────────┘     └────────────────────────┘
                                                                 │
                                                                 ▼
┌─────────────────┐     ┌──────────────────────┐     ┌────────────────────────┐
│ Interactive D3  │ <── │ Zustand Store        │ <── │ Normalizer & Audit     │
│ Gantt Waterfall │     │ React Client UI      │     │ Deterministic Engine   │
└─────────────────┘     └──────────────────────┘     └────────────────────────┘
```

### Data Pipeline Sequence

1. **URL Validation & Security Guardrails**: The input URL is validated and checked against Server-Side Request Forgery (SSRF) restrictions.
2. **Headless Browser Execution**: Playwright launches a headless Chromium instance, navigating to the target website and capturing network request/response lifecycle events.
3. **Telemetry Normalization**: Raw Playwright network events are mapped into normalized `NetworkRequest` interface records, categorizing assets into `document`, `script`, `stylesheet`, `image`, `font`, `xhr/fetch`, or `other`.
4. **Deterministic Audit Suite**: 10 engineering rules evaluate request size, load duration, failure status, 3rd party domain ratios, and duplicate fetches.
5. **Scoring Engine**: Evaluates cumulative weighted penalties to compute a 0–100 performance score.
6. **State & UI Rendering**: Hydrates the client-side Zustand store to render key metric widgets, D3 Gantt waterfall charts, filterable request tables, and a slide-out telemetry inspector.

---

## ✨ Key Technical Features

- 🌐 **Real Browser Network Telemetry**: Zero synthetic estimates. Captures real status codes, HTTP headers, exact durations, and transfer payload sizes.
- 📊 **D3.js Gantt Waterfall Timeline**: High-performance SVG Gantt timeline visualizing asset loading sequences, request offsets, and concurrency bottlenecks.
- 🔎 **Request Telemetry Inspector**: Slide-out drawer displaying detailed HTTP request metadata, response headers, MIME types, and timing offsets.
- 🛡️ **SSRF Security Layer**: Strict protocol white-listing (`http://`, `https://`) and CIDR blocklisting preventing intranet probing (`127.0.0.1`, `localhost`, `10.x.x.x`, `172.16-31.x.x`, `192.168.x.x`).
- 🗂️ **Filterable Data Table**: Sortable request data table with real-time category filtering (HTML, Scripts, Styles, Images, Fonts, API, Failed, 3rd-Party) and text search.

---

## 📐 Audit Rules & Scoring Engine

WebTrace evaluates network activity using 10 deterministic engineering rules:

| # | Rule Name | Trigger Condition | Severity | Penalty |
|---|---|---|---|---|
| 1 | **Large JavaScript** | JS Bundle > 500 KB / 1 MB | Warning / Critical | -8 / -15 |
| 2 | **Large Images** | Image File > 200 KB / 500 KB | Warning / Critical | -6 / -12 |
| 3 | **Slow Requests** | Request Duration > 1000 ms | Warning / Critical | -6 / -12 |
| 4 | **Failed Requests** | HTTP 4xx, 5xx, or Network Error | Critical | -5 per fail (max -25) |
| 5 | **Excessive Requests** | Total Request Count > 100 | Warning / Critical | -8 / -15 |
| 6 | **Third-Party Bloat** | External Domain Ratio > 30% | Info / Warning | -4 / -8 |
| 7 | **Heavy Page** | Total Transfer Size > 5 MB | Warning / Critical | -8 / -15 |
| 8 | **Slow API Calls** | XHR/Fetch Duration > 1000 ms | Warning / Critical | -6 / -12 |
| 9 | **Duplicate Requests** | Identical asset URL fetched multiple times | Warning | -5 |
| 10 | **Large CSS** | Stylesheet > 200 KB | Warning / Critical | -5 / -10 |

### Scoring Heuristic

```
Base Score = 100
Final Score = Max(0, Base Score - Cumulative Rule Penalties)
```

| Score Range | Category |
|---|---|
| 90 – 100 | Excellent |
| 75 – 89 | Good |
| 50 – 74 | Needs Improvement |
| 0 – 49 | Poor |

---

## 🛠️ Technology Stack

| Layer | Technology | Function |
|---|---|---|
| **Framework** | Next.js (App Router) | React Server Components & API Route Handler |
| **Language** | TypeScript | Strict type definitions across network schemas and rule engine |
| **Automation** | Playwright + Chromium | Headless browser execution & network interception |
| **State** | Zustand | Single store managing application state & filtering |
| **Visualization** | D3.js | Dynamic SVG Gantt chart timeline rendering |
| **Styling** | Tailwind CSS | Utility-first layout & typography styling |
| **Icons & Fonts** | Lucide React + Google Fonts | Plus Jakarta Sans & JetBrains Mono |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x

### Installation

```bash
# Clone repository
git clone https://github.com/Cyberpunk738/Webtrace.git
cd Webtrace

# Install dependencies
npm install

# Install Playwright Chromium browser binary
npx playwright install chromium
```

### Development Server

```bash
npm run dev
```

Application starts at `http://localhost:3000`.

### Production Build & Test

```bash
# Build optimized production bundle
npm run build
npm run start

# Execute engine unit tests
npm run test
```

---

## 📁 Directory Structure

```text
Webtrace/
├── app/
│   ├── page.tsx                    # Main landing & dashboard view
│   ├── layout.tsx                  # Root layout & Google Font loaders
│   ├── globals.css                 # Base styles & theme utilities
│   └── api/
│       └── analyze/
│           └── route.ts            # POST /api/analyze execution endpoint
│
├── components/
│   ├── landing/
│   │   ├── Header.tsx              # Top navigation bar
│   │   ├── Hero.tsx                # Hero section with 3D sculpture display
│   │   └── UrlInput.tsx            # URL validation & form control
│   │
│   ├── analysis/
│   │   ├── AnalysisHeader.tsx      # Progress loader & result domain header
│   │   ├── ScoreCard.tsx           # SVG score gauge widget
│   │   ├── MetricCard.tsx          # Key metric display widgets
│   │   ├── ResourceBreakdown.tsx   # Segmented payload ratio bar
│   │   └── IssuesPanel.tsx         # Categorized performance issue list
│   │
│   ├── waterfall/
│   │   ├── Waterfall.tsx           # D3.js Gantt network waterfall chart
│   │   └── RequestDrawer.tsx       # HTTP header & telemetry inspector drawer
│   │
│   └── requests/
│       ├── RequestTable.tsx        # Sortable request telemetry table
│       └── RequestFilters.tsx      # Category filter pills & search input
│
├── crawler/
│   ├── browser.ts                  # Chromium launch configuration
│   ├── capture.ts                  # Playwright network listener
│   └── types.ts                    # Crawler options & timing interfaces
│
├── engine/
│   ├── analyzer.ts                 # Assembles final AnalysisResult
│   ├── normalizer.ts               # Maps raw events to NetworkRequest schema
│   ├── scoring.ts                  # Deterministic 0-100 score engine
│   └── rules/                      # Individual audit rule implementations
│
├── lib/
│   ├── url.ts                      # SSRF protection & URL normalizer
│   └── format.ts                   # Byte, duration, and number formatters
│
├── store/
│   └── analysis-store.ts           # Zustand global state manager
│
├── types/
│   ├── network.ts                  # Network request & raw event interfaces
│   ├── analysis.ts                 # Analysis result & summary interfaces
│   └── issues.ts                   # Performance issue interface
│
├── README.md
├── package.json
└── tsconfig.json
```

---

## 🔌 API Specification

### `POST /api/analyze`

Executes browser instrumentation and performance evaluation for a given URL.

#### Request Payload
```json
{
  "url": "https://example.com"
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "result": {
    "url": "https://example.com",
    "domain": "example.com",
    "timestamp": "2026-08-12T11:00:00.000Z",
    "summary": {
      "score": 92,
      "scoreCategory": "Excellent",
      "requestCount": 24,
      "totalTransferSize": 1420000,
      "totalDuration": 1250,
      "failedRequests": 0,
      "thirdPartyRequests": 3
    },
    "resources": {
      "document": 1,
      "scripts": 8,
      "stylesheets": 3,
      "images": 10,
      "fonts": 2,
      "api": 0,
      "other": 0
    },
    "requests": [ ... ],
    "issues": [ ... ],
    "timing": { ... }
  }
}
```

---

## 🎨 UI & Frontend Architecture

The user interface follows a high-contrast, developer-tool design system:

- **Typography System**: `Plus Jakarta Sans` for UI copy and headings; `JetBrains Mono` for network payloads, HTTP status codes, and code blocks.
- **Layout Grid**: 1px Hairline border grid structure separating hero sections, metric cards, and data panels.
- **Color Palette**: High-contrast black and white palette (`#ffffff` canvas, `#0f172a` text, `#e2e8f0` borders) with semantic status accents (`emerald` for clean, `amber` for warning, `rose` for critical/failed).

---

## 📜 License

Distributed under the MIT License. Built for developer performance intelligence.
