# ⚡ WebTrace — Website Performance Intelligence Engine

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-Chromium-green?style=flat-square&logo=playwright)](https://playwright.dev/)
[![D3.js](https://img.shields.io/badge/D3.js-v7-orange?style=flat-square&logo=d3.js)](https://d3js.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

**WebTrace** is a developer-centric performance analysis engine. It loads any public website inside a real Chromium browser via Playwright, intercepts 100% of network traffic, normalizes raw telemetry into structured data records, evaluates it against a deterministic rule engine, and presents an interactive waterfall telemetry dashboard.

> 💡 **No AI Guesswork, Zero Fake Data**: Every metric originates from real browser network activity, and every recommendation is backed by a deterministic engineering rule.

---

## 🎨 Design System & Theme

WebTrace features a **Monochrome White & Black** design system inspired by high-end developer tools (*Mobius, Linear, Vercel, Sentry*):

- ⚪ **Pure White (`#ffffff`) Canvas** — Clean, high-contrast visual clarity
- ⬛ **Stark Black (`#000000`) Typography & Controls** — Ultra-readable typography with `Plus Jakarta Sans` & `JetBrains Mono`
- 📐 **Hairline Grid Layout System** — 1px subtle border lines separating hero sections, metric cards, and feature pillars
- 🖼️ **Custom 3D Telemetry Sculpture Asset** — Custom Mobius-loop matte black network node visual render (`public/hero-3d-white.png`)

---

## 🔁 Recent Changes: Added & Removed Summary

### ➕ Added & Upgraded Features

- 🎨 **White & Black Monochrome UI Theme**: Fully updated from dark-mode to a high-contrast white & black Mobius design reference layout.
- 🖼️ **3D Hero Telemetry Sculpture**: Integrated custom 3D network node render with subtle technical specs overlays (`SYS::PLAYWRIGHT_ENGINE`, `SUB_MS_PRECISION`).
- 🔤 **Google Typography Integration**: Configured `Plus Jakarta Sans` for clean sans-serif UI elements and `JetBrains Mono` for code & network telemetry.
- 🛡️ **SSRF Security Protection (`lib/url.ts`)**: Built-in guardrails blocking private IPs (`127.0.0.1`, `localhost`, `10.x.x.x`, `172.16-31.x.x`, `192.168.x.x`, `169.254.x.x`) and non-HTTP protocols (`file://`, `ftp://`).
- 📊 **D3.js Gantt Waterfall Chart (`components/waterfall/Waterfall.tsx`)**: Interactive timeline mapping asset execution sequence with color-coded pills, grid lines, and hover states.
- 🔎 **Telemetry Inspector Drawer (`components/waterfall/RequestDrawer.tsx`)**: Slide-out panel providing deep visibility into HTTP status, response headers, transfer size, and MIME types.
- 📋 **Filtered Telemetry Data Table (`components/requests/RequestTable.tsx`)**: Searchable and sortable request table with category tabs (HTML, Scripts, Styles, Images, Fonts, API, Failed, Third-Party).

### 🗑️ Removed Features & Refactorings

- 🗑️ **Demo Dataset Removal**: Deleted `lib/demo-data.ts` and all hardcoded mock fallback data.
- 🗑️ **`isDemo` Flag & Branches Removed**: Removed all demo flags and conditional branches across `analysis-store.ts`, `app/api/analyze/route.ts`, `Header.tsx`, `Hero.tsx`, and `AnalysisHeader.tsx`.
- 🗑️ **Mock Fallbacks Purged**: Every single metric displayed on the dashboard is now 100% real live network telemetry captured via Playwright.

---

## ⚙️ How It Works

```
URL Input → Security Validation → Playwright Chromium → Intercept Telemetry → Normalization → 10 Audit Rules → Score Engine → Dashboard
```

1. **User Submits URL** — Passed through `validateAndNormalizeUrl()` for SSRF and syntax validation.
2. **Playwright Chromium Launch** — Headless browser opens target page under real network condition settings.
3. **Telemetry Capture** — Every request/response cycle is intercepted, measuring duration, status codes, headers, and transfer byte sizes.
4. **Data Normalization** — Raw browser events are mapped into structured `NetworkRequest` records.
5. **Deterministic Audit Engine** — 10 engineering rules evaluate the site's network efficiency.
6. **Scoring Model** — Calculates a 0–100 score based on weighted issue penalties.
7. **Dashboard Render** — Score gauge, key metrics, resource bar, issue panel, D3 waterfall, and request drawer.

---

## 🚀 Tech Stack

| Layer | Technology | Details |
|---|---|---|
| 💻 **Framework** | Next.js (App Router) | React Server Components + Client Hooks |
| 📘 **Language** | TypeScript | Strict typing across all network & engine models |
| 🎨 **Styling** | Tailwind CSS | Custom fonts, hairline grid patterns, light theme tokens |
| 🧠 **State Management** | Zustand | Single store managing analysis state & filtering |
| 🌐 **Automation** | Playwright + Chromium | Headless browser network event interception |
| 📈 **Visualization** | D3.js | SVG horizontal Gantt waterfall timeline chart |
| 🔣 **Icons & Fonts** | Lucide React + Google Fonts | Plus Jakarta Sans & JetBrains Mono |

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x

### Installation

```bash
# 1. Clone repository
git clone https://github.com/Cyberpunk738/Webtrace.git
cd Webtrace

# 2. Install NPM dependencies
npm install

# 3. Install Playwright Chromium browser binary
npx playwright install chromium
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
```

### Automated Unit Tests

```bash
npm run test
```

---

## 📁 Project Structure

```
Webtrace/
├── app/
│   ├── page.tsx                    # Main landing & dashboard container
│   ├── layout.tsx                  # Root layout with Google Fonts & Header
│   ├── globals.css                 # Theme tokens, grid patterns, custom scrollbars
│   └── api/
│       └── analyze/
│           └── route.ts            # POST /api/analyze execution endpoint
│
├── components/
│   ├── landing/
│   │   ├── Header.tsx              # Mobius-style top navigation bar
│   │   ├── Hero.tsx                # 2-Column split hero with 3D sculpture & feature grid
│   │   └── UrlInput.tsx            # URL validation & input action bar
│   │
│   ├── analysis/
│   │   ├── AnalysisHeader.tsx      # Progress stages & domain header
│   │   ├── ScoreCard.tsx           # SVG circular score gauge
│   │   ├── MetricCard.tsx          # Key metric display widgets
│   │   ├── ResourceBreakdown.tsx   # Segmented payload distribution bar
│   │   └── IssuesPanel.tsx         # Categorized performance audit issue list
│   │
│   ├── waterfall/
│   │   ├── Waterfall.tsx           # D3.js Gantt network waterfall chart
│   │   └── RequestDrawer.tsx       # Slide-out HTTP header & telemetry inspector drawer
│   │
│   └── requests/
│       ├── RequestTable.tsx        # Sortable telemetry data table
│       └── RequestFilters.tsx      # Resource type filter pills & search box
│
├── crawler/
│   ├── browser.ts                  # Playwright browser instance launcher
│   ├── capture.ts                  # Network request interception logic
│   └── types.ts                    # Crawler options & timing interfaces
│
├── engine/
│   ├── analyzer.ts                 # Full AnalysisResult builder
│   ├── normalizer.ts               # Raw browser event normalizer
│   ├── scoring.ts                  # Deterministic 0–100 score engine
│   └── rules/
│       ├── index.ts                # Audit rule suite runner
│       ├── large-javascript.ts     # Rule 1: JS bundle > 500 KB
│       ├── large-images.ts         # Rule 2: Image asset > 200 KB
│       ├── slow-requests.ts        # Rule 3: Duration > 1000 ms
│       ├── failed-requests.ts      # Rule 4: HTTP 4xx, 5xx, or network error
│       ├── request-count.ts        # Rule 5: Total request count > 100
│       ├── third-party.ts          # Rule 6: External domain ratio
│       ├── large-page.ts           # Rule 7: Total transfer > 5 MB
│       ├── slow-api.ts             # Rule 8: XHR/Fetch duration > 1000 ms
│       ├── duplicate-requests.ts   # Rule 9: Identical asset URL re-fetching
│       └── large-css.ts            # Rule 10: CSS stylesheet > 200 KB
│
├── lib/
│   ├── url.ts                      # SSRF security validation & hostname normalizer
│   └── format.ts                   # Byte, time duration, and number formatters
│
├── public/
│   └── hero-3d-white.png           # Custom 3D network node sculpture render
│
├── store/
│   └── analysis-store.ts           # Zustand store for application state
│
├── types/
│   ├── network.ts                  # NetworkRequest & RawCapturedEvent models
│   ├── analysis.ts                 # AnalysisResult & Summary models
│   └── issues.ts                   # PerformanceIssue interface
│
├── README.md
├── package.json
└── tsconfig.json
```

---

## 🔍 Deterministic Audit Rules

WebTrace evaluates network telemetry against **10 built-in engineering rules**:

| # | Icon | Rule Name | Trigger Condition | Severity | Penalty |
|---|---|---|---|---|---|
| 1 | 📦 | **Large JavaScript** | JS Bundle > 500 KB / 1 MB | Warning / Critical | -8 / -15 |
| 2 | 🖼️ | **Large Images** | Image File > 200 KB / 500 KB | Warning / Critical | -6 / -12 |
| 3 | ⏳ | **Slow Requests** | Duration > 1000 ms | Warning / Critical | -6 / -12 |
| 4 | ❌ | **Failed Requests** | HTTP 4xx, 5xx, or Network Error | Critical | -5 per fail (max -25) |
| 5 | 🔢 | **Excessive Requests** | Total Requests > 100 | Warning / Critical | -8 / -15 |
| 6 | 🌐 | **Third-Party Bloat** | External Domain Ratio > 30% | Info / Warning | -4 / -8 |
| 7 | 🐘 | **Heavy Page** | Total Transfer > 5 MB | Warning / Critical | -8 / -15 |
| 8 | 📡 | **Slow API Calls** | XHR/Fetch Duration > 1000 ms | Warning / Critical | -6 / -12 |
| 9 | 🔄 | **Duplicate Requests** | Same asset URL fetched multiple times | Warning | -5 |
| 10 | 🎨 | **Large CSS** | Stylesheet > 200 KB | Warning / Critical | -5 / -10 |

---

## 🛡️ Security & SSRF Protection

WebTrace enforces strict URL validation before launching Playwright browser contexts:

- ✅ **Protocol White-listing**: Only `http://` and `https://` schemes permitted. Rejects `file://`, `ftp://`, `data:`, `gopher://`.
- ✅ **Private IP & Loopback Blocking**: Restricts requests targeting `localhost`, `127.0.0.1`, `0.0.0.0`, `::1`.
- ✅ **Intranet CIDR Blocklist**: Rejects private IP ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16`).
- ✅ **Domain Validation**: Validates hostname format and TLD syntax.

---

## 🔌 API Reference

### `POST /api/analyze`

Executes a live browser network audit on the provided target URL.

#### Request Body
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

## 📜 License

Distributed under the MIT License. Built for developer performance intelligence.
