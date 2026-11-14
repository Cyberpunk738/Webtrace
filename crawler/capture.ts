import { launchBrowser, createBrowserContext } from "./browser";
import { CrawlerOptions, CrawlerCaptureResult } from "./types";
import { RawCapturedEvent } from "../types/network";
import { assertPublicUrl } from "../lib/safe-fetch";
import type { Request } from "playwright-core";

export async function captureNetworkActivity(
  targetUrl: string,
  options: CrawlerOptions = {},
  dependencies = { launchBrowser, createBrowserContext, assertPublicUrl },
): Promise<CrawlerCaptureResult> {
  const browser = await dependencies.launchBrowser();
  try {
    const context = await dependencies.createBrowserContext(browser);
    // Validate redirects and subresources as well as the top-level target.
    await context.route("**/*", async (route) => {
      try {
        await dependencies.assertPublicUrl(route.request().url());
        await route.continue();
      } catch {
        await route.abort("blockedbyclient");
      }
    });
    await context.routeWebSocket("**/*", (socket) => socket.close());
    const page = await context.newPage();
    const events = new Map<Request, RawCapturedEvent>();
    const pending = new Set<Promise<void>>();
    const completed = new Set<Request>();
    const started = Date.now();
    let counter = 0;
    page.on("request", (req) => {
      const startTime = Date.now() - started;
      events.set(req, {
        requestId: `req_${++counter}`,
        url: req.url(),
        method: req.method(),
        resourceType: req.resourceType(),
        status: null,
        startTime,
        endTime: startTime,
        transferSize: 0,
        requestHeaders: req.headers(),
        failed: false,
      });
    });
    page.on("response", (res) => {
      const event = events.get(res.request());
      if (!event) return;
      event.status = res.status();
      event.statusText = res.statusText();
      event.responseHeaders = res.headers();
      event.mimeType = event.responseHeaders["content-type"]?.split(";")[0];
      event.failed = res.status() >= 400;
      if (event.failed)
        event.failureReason = `HTTP ${res.status()} ${res.statusText()}`;
    });
    page.on("requestfinished", (req) => {
      completed.add(req);
      const event = events.get(req);
      if (!event) return;
      event.endTime = Date.now() - started;
      // Response headers arrive before the body. Measure completion and encoded bytes only after finish.
      const task = req
        .sizes()
        .then((sizes) => {
          event.transferSize = sizes.responseBodySize;
        })
        .catch(() => {});
      pending.add(task);
      void task.finally(() => pending.delete(task));
    });
    page.on("requestfailed", (req) => {
      completed.add(req);
      const event = events.get(req);
      if (!event) return;
      event.endTime = Date.now() - started;
      event.failed = true;
      event.failureReason =
        req.failure()?.errorText || "Network request failed";
    });
    await page.goto(targetUrl, {
      waitUntil: "domcontentloaded",
      timeout: options.timeoutMs || 20000,
    });
    // Bounded observation window; do not describe this as rendering time or Core Web Vitals.
    await page.waitForTimeout(1500);
    const finalUrl = page.url();
    const totalLoadTime = Date.now() - started;
    const incomplete = [...events]
      .filter(([request]) => !completed.has(request))
      .map(([, event]) => event);
    await context.close();
    await Promise.allSettled([...pending]);
    const rawEvents = [...events.values()];
    for (const event of incomplete) {
      event.endTime = totalLoadTime;
      event.failed = true;
      event.failureReason = "Still pending when capture ended";
    }
    return {
      targetUrl,
      finalUrl,
      mode: "browser",
      warnings: [
        "Browser capture ends 1.5 seconds after DOM content loads. Timings cover that observation window, not Core Web Vitals. Sizes are encoded response body bytes.",
        ...(incomplete.length
          ? [
              `${incomplete.length} requests were unfinished when capture ended.`,
            ]
          : []),
      ],
      rawEvents,
      timing: {
        navigationStart: 0,
        firstRequestTime: rawEvents[0]?.startTime || 0,
        lastResponseTime: Math.max(0, ...rawEvents.map((e) => e.endTime)),
        totalLoadTime,
      },
    };
  } finally {
    await browser.close().catch(() => {});
  }
}
