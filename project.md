# WebTrace — Project Specification

## 1. Project Overview

**WebTrace** is a developer-focused website performance intelligence tool.

The core experience is simple:

> A user enters a website URL → WebTrace loads the website in a real browser → captures network activity → analyzes it → produces an actionable performance report.

WebTrace is NOT intended to be a generic website speed checker or a clone of Google Lighthouse.

The goal is to build a technically impressive but focused MVP that demonstrates strong frontend engineering, data visualization, browser automation, performance analysis, and product design.

---

# 2. Core User Flow

The entire MVP should revolve around this flow:

```text
Landing Page
     ↓
Enter Website URL
     ↓
Analyze
     ↓
WebTrace loads website
     ↓
Capture network activity
     ↓
Normalize network data
     ↓
Run analysis engine
     ↓
Generate performance score
     ↓
Display report
```

Example:

```text
https://example.com
        ↓
    [Analyze]
        ↓
   Analyzing...
        ↓
Performance Report
```

The user should NOT need to understand HAR files, Playwright, browser automation, or the internal architecture.

Those are implementation details.

---

# 3. MVP Definition

The MVP is considered complete when a user can:

1. Enter a valid public website URL.
2. Start an analysis.
3. See analysis progress.
4. WebTrace loads the website using a real browser.
5. Network requests are captured.
6. Requests are normalized into a consistent internal format.
7. Performance metrics are calculated.
8. Performance issues are detected.
9. A performance score is generated.
10. Results are displayed in a polished dashboard.
11. The user can inspect individual network requests.
12. The user can view an interactive network waterfall.
13. The user can filter/search requests.
14. The user can see actionable recommendations.
15. The user can run another analysis.

Anything beyond this is secondary.

---

# 4. IMPORTANT: Scope Discipline

This project should be completed in approximately **1–2 weeks**.

Do NOT expand the MVP unless explicitly instructed.

Do NOT add:

* Authentication
* Payments
* Subscriptions
* Teams
* Organizations
* User accounts
* Social features
* AI chatbot
* AI-generated recommendations
* Real-time monitoring
* WebSockets
* Database persistence
* Chrome extension
* GitHub integration
* CI/CD integration
* Mobile application
* Browser extension
* WebAssembly
* Complex distributed infrastructure

These may become future versions.

The MVP must remain focused.

---

# 5. Product Philosophy

WebTrace should feel like a serious developer tool.

Avoid:

* Generic SaaS design
* Excessive gradients
* Fake glassmorphism
* Huge meaningless hero sections
* Excessive animations
* "AI-powered" everywhere
* Fake metrics
* Hardcoded analysis results
* Fake loading screens
* Generic dashboard templates

The UI should feel closer to:

* Chrome DevTools
* Vercel
* Linear
* Raycast
* Sentry
* GitHub
* Modern developer tooling

The product should prioritize:

* Information density
* Clarity
* Hierarchy
* Speed
* Precision
* Excellent empty/loading/error states
* Useful visualizations

---

# 6. Technical Stack

Use:

## Frontend

* Next.js
* TypeScript
* React
* Tailwind CSS

## State

Use Zustand only where global/client state is actually necessary.

Do not introduce state management unnecessarily.

## Data Visualization

Use:

* D3.js for the network waterfall
* Recharts where appropriate for simple charts

Do not use D3 for everything.

## Browser Automation

Use:

* Playwright
* Chromium

Playwright is responsible for loading the target website and observing network activity.

## Backend

Use a lightweight API layer.

The browser automation should be separated from the frontend where necessary.

Preferred architecture:

```text
Next.js Frontend
       ↓
Analysis API
       ↓
Playwright Crawler
       ↓
Network Data
       ↓
Analysis Engine
       ↓
Analysis Result
       ↓
Frontend Dashboard
```

Do not introduce a database for MVP.

---

# 7. High-Level Architecture

```text
                         WEBTRACE
                            │
                            ▼
                    ┌───────────────┐
                    │ Next.js UI    │
                    └───────┬───────┘
                            │
                     POST /analyze
                            │
                            ▼
                    ┌───────────────┐
                    │ Analysis API  │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │   Playwright  │
                    │    Chromium   │
                    └───────┬───────┘
                            │
                     Network Events
                            │
                            ▼
                    ┌───────────────┐
                    │ Data Normalize│
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ Analysis      │
                    │ Engine        │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ AnalysisResult│
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ Dashboard     │
                    └───────────────┘
```

---

# 8. Repository Structure

Use a structure similar to:

```text
webtrace/
│
├── app/
│   ├── page.tsx
│   ├── analyze/
│   │   └── page.tsx
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts
│   └── globals.css
│
├── components/
│   ├── landing/
│   │   ├── Hero.tsx
│   │   ├── UrlInput.tsx
│   │   └── DemoPreview.tsx
│   │
│   ├── analysis/
│   │   ├── AnalysisHeader.tsx
│   │   ├── ScoreCard.tsx
│   │   ├── MetricCard.tsx
│   │   ├── IssuesPanel.tsx
│   │   ├── ResourceBreakdown.tsx
│   │   └── PerformanceSummary.tsx
│   │
│   ├── waterfall/
│   │   ├── Waterfall.tsx
│   │   ├── WaterfallRow.tsx
│   │   ├── WaterfallTimeline.tsx
│   │   └── RequestDrawer.tsx
│   │
│   ├── requests/
│   │   ├── RequestTable.tsx
│   │   ├── RequestFilters.tsx
│   │   └── RequestDetails.tsx
│   │
│   └── ui/
│
├── crawler/
│   ├── browser.ts
│   ├── capture.ts
│   └── types.ts
│
├── engine/
│   ├── analyzer.ts
│   ├── metrics.ts
│   ├── scoring.ts
│   ├── normalizer.ts
│   │
│   └── rules/
│       ├── large-assets.ts
│       ├── slow-requests.ts
│       ├── failed-requests.ts
│       ├── request-count.ts
│       ├── third-party.ts
│       ├── duplicate-requests.ts
│       ├── large-page.ts
│       ├── large-javascript.ts
│       ├── slow-api.ts
│       └── index.ts
│
├── lib/
│   ├── url.ts
│   ├── domains.ts
│   ├── format.ts
│   └── constants.ts
│
├── store/
│   └── analysis-store.ts
│
├── types/
│   ├── network.ts
│   ├── analysis.ts
│   └── issues.ts
│
├── public/
│
├── tests/
│
├── PROJECT.md
├── README.md
└── package.json
```

Adjust this structure if necessary, but maintain separation between:

* UI
* crawler
* normalization
* analysis engine
* state
* types

---

# 9. Core Data Model

The crawler should NOT expose raw Playwright objects directly to the UI.

Normalize everything into WebTrace's own data model.

Example:

```ts
export interface NetworkRequest {
  id: string;

  url: string;
  method: string;

  status: number | null;
  statusText?: string;

  resourceType:
    | "document"
    | "stylesheet"
    | "script"
    | "image"
    | "font"
    | "xhr"
    | "fetch"
    | "media"
    | "other";

  domain: string;

  startTime: number;
  endTime: number;
  duration: number;

  transferSize: number;

  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;

  mimeType?: string;

  cached?: boolean;

  failed?: boolean;
  failureReason?: string;
}
```

The exact model can evolve as implementation requires.

---

# 10. Analysis Result

The analysis engine should return something conceptually similar to:

```ts
export interface AnalysisResult {
  url: string;

  timestamp: string;

  summary: {
    score: number;

    requestCount: number;

    totalTransferSize: number;

    totalDuration: number;

    failedRequests: number;

    thirdPartyRequests: number;
  };

  resources: {
    document: number;
    scripts: number;
    stylesheets: number;
    images: number;
    fonts: number;
    api: number;
    other: number;
  };

  requests: NetworkRequest[];

  issues: PerformanceIssue[];

  timing: {
    navigationStart: number;
    firstRequest: number;
    lastResponse: number;
    totalLoadTime: number;
  };
}
```

---

# 11. Performance Issue Model

Issues should be structured.

```ts
export interface PerformanceIssue {
  id: string;

  severity: "critical" | "warning" | "info";

  category:
    | "javascript"
    | "images"
    | "network"
    | "requests"
    | "third-party"
    | "api"
    | "general";

  title: string;

  description: string;

  recommendation: string;

  affectedRequests?: string[];

  metric?: {
    value: number;
    unit: string;
  };
}
```

This allows the UI to render issues consistently.

---

# 12. Initial Analysis Rules

Implement these rules first.

## Rule 1 — Large JavaScript

Trigger when a JavaScript resource exceeds a reasonable threshold.

Example:

```text
> 500 KB
```

Severity:

```text
warning
```

Very large files can become:

```text
critical
```

Recommendation:

* code splitting
* lazy loading
* tree shaking
* dependency analysis

Do not pretend these recommendations are guaranteed fixes.

---

## Rule 2 — Large Images

Flag images over approximately:

```text
200 KB
```

Include:

* URL
* size
* recommendation

Recommendation:

* compression
* WebP/AVIF
* responsive images
* lazy loading

---

## Rule 3 — Slow Requests

Flag requests taking more than:

```text
1000ms
```

Show:

```text
URL
Duration
Resource type
Status
```

---

## Rule 4 — Failed Requests

Detect:

```text
4xx
5xx
network failures
```

Group them separately.

---

## Rule 5 — Excessive Requests

Flag pages with unusually high request counts.

Initial threshold:

```text
> 100 requests
```

Keep thresholds configurable.

---

## Rule 6 — Third-Party Requests

Determine whether request domain differs from the target site's primary domain.

Group:

```text
analytics
advertising
fonts
CDNs
payment providers
social widgets
etc.
```

Do not hardcode a list of "bad" third parties.

Third-party does NOT automatically mean bad.

---

## Rule 7 — Heavy Page

Flag when total transferred data exceeds:

```text
5 MB
```

Severity depends on the total size.

---

## Rule 8 — Slow API

Identify:

```text
XHR
Fetch
```

requests exceeding:

```text
1000ms
```

---

## Rule 9 — Duplicate Requests

Detect repeated requests to the same URL.

Flag only when repetition is meaningful.

Do not flag legitimate repeated API calls automatically.

---

## Rule 10 — Large CSS

Flag CSS resources exceeding:

```text
200 KB
```

Recommendation:

* remove unused CSS
* split CSS
* minimize stylesheet payload

---

# 13. Performance Score

The score should be deterministic.

Do NOT use AI.

Start with a simple weighted scoring model.

Example:

```text
Base score = 100

Penalties:

Large JS:
-5 to -15

Large images:
-2 each, capped

Slow requests:
-2 each, capped

Failed requests:
-5 each

High request count:
-5 to -15

Heavy page:
-5 to -15

Large CSS:
-3 to -10
```

The exact formula can be adjusted during development.

The score must be:

```text
0–100
```

Use categories:

```text
90–100 → Excellent
75–89  → Good
50–74  → Needs Improvement
0–49   → Poor
```

The score is a WebTrace heuristic.

Do NOT claim that it is equivalent to Lighthouse or Google's performance score.

---

# 14. Dashboard

The dashboard should contain:

## Header

```text
WebTrace
example.com

[ Analyze Again ]
```

---

## Score

```text
Performance Score

78

GOOD
```

---

## Key Metrics

Show:

```text
Requests
Transfer Size
Load Time
Failed Requests
Third-Party Requests
```

---

## Issues

Example:

```text
Performance Issues

🔴 Large JavaScript
main.js — 1.42 MB

🟠 Heavy image
hero.jpg — 843 KB

🟠 Slow API request
/api/products — 1.82s

🟡 Third-party dependency
23 third-party requests
```

Clicking an issue should reveal affected requests where possible.

---

# 15. Waterfall

The waterfall is one of the most important UI components.

Requirements:

* horizontal timeline
* request rows
* resource name
* request type
* status
* duration
* visual timing bar
* hover state
* click to inspect
* vertical scrolling
* sticky header
* zoom if practical

Example:

```text
REQUEST              0ms       500ms      1000ms

index.html           ███████

style.css                █████

main.js                    ███████████

hero.webp                      █████████████

analytics.js                         ██████
```

The waterfall should be based on real captured timings.

Never fake timing data.

---

# 16. Request Table

Provide a detailed request table.

Columns:

```text
Name
Status
Type
Domain
Size
Duration
```

Features:

* search
* filter by type
* filter by status
* sort by size
* sort by duration
* sort by status
* click request

Example filters:

```text
All
Documents
Scripts
Styles
Images
Fonts
API
Failed
Third-party
```

---

# 17. Request Details Drawer

When a request is selected:

```text
REQUEST DETAILS

main.js

GET
200 OK

URL
https://example.com/assets/main.js

Type
Script

Size
1.42 MB

Duration
483ms

Domain
example.com
```

If available:

```text
Timing

Start
Queue
Connection
Response
Download
```

Do not display information that was not actually captured.

---

# 18. Loading Experience

Analysis may take several seconds.

Do not show a generic spinner only.

Show meaningful stages:

```text
Analyzing example.com

✓ Launching browser
✓ Loading page
✓ Capturing requests
● Analyzing network activity
○ Generating report
```

Progress should reflect actual stages where possible.

Do not fake percentage progress.

---

# 19. Error Handling

Handle:

### Invalid URL

```text
Enter a valid public URL.
```

### Website unreachable

```text
WebTrace couldn't reach this website.

The site may be offline, blocking automated browsers,
or unavailable from the analysis environment.
```

### Timeout

```text
The website took too long to respond.
```

### Browser/crawler failure

Show a useful message.

Never expose raw stack traces to users.

---

# 20. Security Requirements

User-provided URLs are dangerous from a server-side perspective.

The crawler must consider:

* SSRF
* localhost
* private IP addresses
* internal network addresses
* file URLs
* unsupported protocols
* arbitrary ports

Only support:

```text
http://
https://
```

Do not allow the crawler to access:

```text
localhost
127.0.0.1
0.0.0.0
private IP ranges
internal hostnames
file://
```

Implement URL validation before browser navigation.

This is an MVP security requirement, not an optional feature.

---

# 21. Performance

Do not allow a single analysis to run indefinitely.

Use:

* navigation timeout
* request limits if necessary
* resource limits
* reasonable page-load timeout

Avoid downloading unnecessarily huge resources if practical.

Keep the analysis bounded.

---

# 22. Landing Page

The landing page should be minimal.

Hero:

```text
Understand what's slowing down your website.

WebTrace analyzes your site's network activity
and shows you exactly where performance is being lost.

[ https://example.com              ]

[ Analyze Website ]
```

Secondary explanation:

```text
Network requests
Performance bottlenecks
Asset sizes
Third-party dependencies
Actionable recommendations
```

Do NOT fill the landing page with generic SaaS sections.

The product itself is the hero.

---

# 23. Demo

The deployed application should include a demo option.

If live URL analysis is temporarily unavailable, provide a pre-recorded/demo analysis using a bundled dataset.

However:

**Real URL analysis is the primary experience.**

Demo data should never be presented as real-time analysis.

Clearly label demo results.

---

# 24. Development Strategy

Build vertically.

Do NOT build the entire UI first.

Recommended sequence:

### Milestone 1

URL → Playwright → captured requests → console output.

### Milestone 2

Captured requests → normalized data.

### Milestone 3

Normalized data → analysis engine.

### Milestone 4

Analysis engine → JSON result.

### Milestone 5

JSON result → basic dashboard.

### Milestone 6

Dashboard → waterfall.

### Milestone 7

Dashboard → request inspection.

### Milestone 8

Polish + error handling + deployment.

At every milestone, keep the application working.

---

# 25. Testing

Test the analysis engine independently from the UI.

Create fixture datasets representing:

```text
small fast website
large JavaScript website
heavy image website
many requests website
failed requests website
slow API website
third-party heavy website
```

Test:

* request counting
* size calculations
* duration calculations
* resource classification
* issue detection
* scoring

The analysis engine should be deterministic.

Same input:

```text
HAR/network dataset
```

should produce the same:

```text
AnalysisResult
```

---

# 26. Code Quality Rules

Use TypeScript strictly.

Avoid:

```ts
any
```

unless absolutely necessary.

Prefer:

```ts
unknown
```

with proper validation.

Do not mix:

* crawling logic
* scoring logic
* UI logic

in the same files.

Keep business logic independent of React.

The analysis engine should ideally be usable without rendering any UI.

---

# 27. AI Usage Rules

AI is allowed during development.

However, WebTrace itself should NOT depend on an LLM for the MVP.

Do not call an LLM to:

* calculate performance scores
* identify file sizes
* detect failed requests
* classify resources
* calculate timings

Those should be deterministic engineering logic.

An AI recommendation layer may be considered for V2.

---

# 28. Design Direction

Visual language:

```text
Dark-first
Developer-focused
Dense
Precise
Minimal
Technical
Fast
```

Suggested layout:

```text
┌─────────────────────────────────────────────────────┐
│ WebTrace                           Analyze New Site │
├─────────────────────────────────────────────────────┤
│                                                     │
│ example.com                                         │
│                                                     │
│   SCORE       REQUESTS       TRANSFER      LOAD     │
│    78           137           4.2MB        2.31s    │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│ PERFORMANCE ISSUES                                  │
│                                                     │
│ 🔴 Large JS                                         │
│ 🟠 Heavy images                                     │
│ 🟡 Third-party requests                             │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│ NETWORK WATERFALL                                   │
│                                                     │
│ HTML       ███████                                  │
│ CSS          █████                                  │
│ JS             █████████████                        │
│ IMAGE              ███████████████                  │
│                                                     │
├─────────────────────────────────────────────────────┤
│ REQUESTS                                            │
│                                                     │
│ Name        Status     Type      Size      Time     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

Do not over-design.

---

# 29. What Makes WebTrace Different

WebTrace should NOT try to beat Lighthouse at everything.

Its differentiation is:

> **Network intelligence and developer-friendly investigation.**

Lighthouse tells you:

```text
Performance: 72
```

WebTrace should help answer:

```text
WHY?

Which requests?
Which assets?
Which domains?
Which files?
How long did they take?
What should I investigate first?
```

The waterfall + request investigation + deterministic issue engine are the core identity.

---

# 30. Future Roadmap

Do NOT implement these during MVP unless explicitly requested.

## V2

* HAR import
* HAR export
* mobile/desktop profiles
* comparison between runs
* shareable reports
* downloadable reports

## V3

* Chrome extension
* automatic browser capture
* URL crawling
* multi-page analysis

## V4

* GitHub integration
* CI performance checks
* PR performance regression reports

## V5

* historical performance monitoring
* scheduled checks
* team accounts
* AI-assisted recommendations

---

# 31. Definition of Done

WebTrace MVP is DONE when:

```text
[✓] User enters URL
[✓] URL validation works
[✓] Browser launches
[✓] Website loads
[✓] Network requests captured
[✓] Requests normalized
[✓] Metrics calculated
[✓] Performance score calculated
[✓] Issues detected
[✓] Dashboard renders real data
[✓] Waterfall renders real timings
[✓] Request table works
[✓] Request drawer works
[✓] Filtering works
[✓] Errors handled
[✓] Security validation implemented
[✓] Demo experience exists
[✓] Production build works
[✓] Application deployed
[✓] README documented
```

---

# 32. Development Rules for Claude

When working on this project:

### Rule 1

**Read PROJECT.md before making architectural decisions.**

### Rule 2

Do not expand the MVP without explicit permission.

### Rule 3

Do not replace working architecture just because another approach looks more sophisticated.

### Rule 4

Prefer simple working implementations over premature abstraction.

### Rule 5

Never hardcode fake analysis results.

### Rule 6

Never hide implementation problems with mock data unless explicitly building a UI prototype.

### Rule 7

Keep the analysis engine independent from the UI.

### Rule 8

When a feature is difficult, implement the smallest correct version first.

### Rule 9

Before adding a dependency, determine whether the feature can reasonably be implemented with the existing stack.

### Rule 10

Do not rewrite unrelated files.

### Rule 11

After meaningful changes, run:

```bash
npm run lint
npm run build
```

and fix errors.

### Rule 12

If a requirement is ambiguous, make the smallest reasonable assumption and continue rather than expanding scope.

### Rule 13

Do not build V2 features during MVP development.

### Rule 14

Every UI metric must originate from actual analysis data.

### Rule 15

Every recommendation should be explainable by a deterministic rule.

---

# 33. Claude's Working Protocol

Before implementing a task:

1. Read `PROJECT.md`.
2. Inspect the existing codebase.
3. Identify the smallest implementation that satisfies the requirement.
4. Implement it.
5. Test it.
6. Run lint/build.
7. Fix errors.
8. Summarize what changed.
9. State what the next milestone is.

Do not continuously refactor unrelated parts of the application.

---

# 34. Current Priority

The immediate priority is:

## MILESTONE 1 — Browser Capture

Build the smallest possible working pipeline:

```text
URL
 ↓
Playwright
 ↓
Chromium
 ↓
Load page
 ↓
Capture requests
 ↓
Return normalized request data
```

Do NOT build the dashboard yet.

First prove that WebTrace can reliably capture network activity from a real website.

Once this works, proceed to:

## MILESTONE 2 — Analysis Engine

```text
Network Data
 ↓
Metrics
 ↓
Rules
 ↓
Score
 ↓
AnalysisResult
```

Then proceed to the UI.

---

# 35. Final Product Principle

WebTrace should feel like a tool a real frontend engineer could actually use.

The project should demonstrate:

* TypeScript
* React/Next.js
* browser automation
* network APIs
* data modeling
* performance analysis
* visualization
* state management
* security awareness
* clean architecture
* developer tooling UX

The goal is NOT to build the biggest project.

The goal is to build a **small product with unusually deep engineering underneath it.**

# END OF PROJECT SPECIFICATION
