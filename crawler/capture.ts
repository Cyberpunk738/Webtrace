import { launchBrowser, createBrowserContext } from './browser';
import { CrawlerOptions, CrawlerCaptureResult } from './types';
import { RawCapturedEvent } from '../types/network';

export async function captureNetworkActivity(
  targetUrl: string,
  options: CrawlerOptions = {}
): Promise<CrawlerCaptureResult> {
  const timeoutMs = options.timeoutMs || 25000;
  const notify = options.onProgress || (() => {});

  notify({ stage: 'launching', message: 'Launching browser engine...', timestamp: Date.now() });

  const browser = await launchBrowser();
  const context = await createBrowserContext(browser);
  const page = await context.newPage();

  const eventsMap = new Map<string, RawCapturedEvent>();
  let requestCounter = 0;
  const navStartTime = Date.now();
  let firstRequestTime = 0;
  let lastResponseTime = 0;

  // Track Playwright request objects mapping
  const pwRequestToId = new Map<object, string>();

  page.on('request', (req) => {
    const now = Date.now();
    const relativeStart = Math.max(0, now - navStartTime);
    if (!firstRequestTime) firstRequestTime = relativeStart;

    requestCounter++;
    const id = `req_${requestCounter}_${Math.random().toString(36).substr(2, 5)}`;
    pwRequestToId.set(req, id);

    let reqHeaders: Record<string, string> = {};
    try {
      reqHeaders = req.headers();
    } catch {
      // ignore
    }

    const event: RawCapturedEvent = {
      requestId: id,
      url: req.url(),
      method: req.method(),
      resourceType: req.resourceType(),
      status: null,
      startTime: relativeStart,
      endTime: relativeStart,
      transferSize: 0,
      requestHeaders: reqHeaders,
      failed: false,
    };

    eventsMap.set(id, event);
  });

  page.on('response', async (res) => {
    const req = res.request();
    const id = pwRequestToId.get(req);
    if (!id) return;

    const event = eventsMap.get(id);
    if (!event) return;

    const now = Date.now();
    const relativeEnd = Math.max(event.startTime, now - navStartTime);
    lastResponseTime = Math.max(lastResponseTime, relativeEnd);

    let resHeaders: Record<string, string> = {};
    try {
      resHeaders = res.headers();
    } catch {
      // ignore
    }

    let transferSize = 0;
    const contentLength = resHeaders['content-length'];
    if (contentLength && !isNaN(Number(contentLength))) {
      transferSize = parseInt(contentLength, 10);
    } else {
      try {
        const bodyBuffer = await res.body().catch(() => null);
        if (bodyBuffer) transferSize = bodyBuffer.length;
      } catch {
        transferSize = 0;
      }
    }

    event.status = res.status();
    event.statusText = res.statusText();
    event.endTime = relativeEnd;
    event.transferSize = transferSize;
    event.responseHeaders = resHeaders;
    event.mimeType = resHeaders['content-type']?.split(';')[0]?.trim() || '';

    if (res.status() >= 400) {
      event.failed = true;
      event.failureReason = `HTTP ${res.status()} ${res.statusText()}`;
    }
  });

  page.on('requestfailed', (req) => {
    const id = pwRequestToId.get(req);
    if (!id) return;

    const event = eventsMap.get(id);
    if (!event) return;

    const now = Date.now();
    const relativeEnd = Math.max(event.startTime, now - navStartTime);
    lastResponseTime = Math.max(lastResponseTime, relativeEnd);

    event.endTime = relativeEnd;
    event.failed = true;
    event.failureReason = req.failure()?.errorText || 'Network request failed';
  });

  notify({ stage: 'loading', message: `Navigating to ${targetUrl}...`, timestamp: Date.now() });

  try {
    // Navigate with domcontentloaded or load strategy
    await page.goto(targetUrl, {
      waitUntil: 'domcontentloaded',
      timeout: timeoutMs,
    });

    notify({ stage: 'capturing', message: 'Capturing network payloads and timing...', timestamp: Date.now() });

    // Allow network to settle briefly (1.5s) to catch async XHR / images
    await page.waitForTimeout(1500);

    const finalUrl = page.url();
    const totalLoadTime = Math.max(0, Date.now() - navStartTime);

    notify({ stage: 'analyzing', message: 'Processing captured network telemetry...', timestamp: Date.now() });

    const rawEvents = Array.from(eventsMap.values());

    return {
      targetUrl,
      finalUrl,
      timing: {
        navigationStart: 0,
        firstRequestTime,
        lastResponseTime: lastResponseTime || totalLoadTime,
        totalLoadTime,
      },
      rawEvents,
    };
  } finally {
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
  }
}
