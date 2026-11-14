import { CrawlerCaptureResult } from "./types";
import { RawCapturedEvent, ResourceType } from "../types/network";
import { safeFetch } from "../lib/safe-fetch";

// Static HTTP inspection: scripts and browser rendering are never simulated.
export async function captureNetworkActivityFallback(
  targetUrl: string,
): Promise<CrawlerCaptureResult> {
  const started = Date.now();
  const rawEvents: RawCapturedEvent[] = [];
  const signal = AbortSignal.timeout(18000);
  const doc = await safeFetch(targetUrl, { signal });
  const html = await readLimitedBody(doc, 2 * 1024 * 1024);
  const finalUrl = doc.url || targetUrl;
  rawEvents.push({
    requestId: "http_document",
    url: finalUrl,
    method: "GET",
    resourceType: "document",
    status: doc.status,
    statusText: doc.statusText,
    startTime: 0,
    endTime: Date.now() - started,
    transferSize: html.byteLength,
    responseHeaders: Object.fromEntries(doc.headers),
    mimeType: doc.headers.get("content-type")?.split(";")[0],
    failed: doc.status >= 400,
    failureReason: doc.status >= 400 ? `HTTP ${doc.status}` : undefined,
  });
  const resources = new Map<string, ResourceType>();
  const content = new TextDecoder().decode(html);
  if (doc.headers.get("content-type")?.includes("text/html")) {
    for (const tag of content.matchAll(/<(script|link|img)\b[^>]*>/gi)) {
      const attr = (name: string) =>
        tag[0].match(
          new RegExp(`\\b${name}\\s*=\\s*["']([^"']+)["']`, "i"),
        )?.[1];
      const type: ResourceType =
        tag[1].toLowerCase() === "script"
          ? "script"
          : tag[1].toLowerCase() === "img"
            ? "image"
            : "stylesheet";
      if (type === "stylesheet" && attr("rel")?.toLowerCase() !== "stylesheet")
        continue;
      const src = attr(type === "stylesheet" ? "href" : "src");
      if (!src) continue;
      try {
        const url = new URL(src, finalUrl);
        if (/^https?:$/.test(url.protocol)) resources.set(url.href, type);
      } catch {
        /* skip malformed references */
      }
    }
  }
  const entries = [...resources].slice(0, 30);
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(4, entries.length) }, async () => {
      while (cursor < entries.length) {
        const index = cursor++;
        const [url, resourceType] = entries[index];
        const event: RawCapturedEvent = {
          requestId: `http_${index}`,
          url,
          method: "GET",
          resourceType,
          status: null,
          startTime: Date.now() - started,
          endTime: 0,
          transferSize: 0,
          failed: false,
        };
        try {
          const res = await safeFetch(url, { signal });
          event.status = res.status;
          event.statusText = res.statusText;
          event.responseHeaders = Object.fromEntries(res.headers);
          event.mimeType = res.headers.get("content-type")?.split(";")[0];
          event.transferSize = (
            await readLimitedBody(res, 8 * 1024 * 1024)
          ).byteLength;
          event.failed = res.status >= 400;
          if (event.failed) event.failureReason = `HTTP ${res.status}`;
        } catch (error) {
          event.failed = true;
          event.failureReason =
            error instanceof Error ? error.message : "Resource fetch failed";
        }
        event.endTime = Date.now() - started;
        rawEvents.push(event);
      }
    }),
  );
  const totalLoadTime = Date.now() - started;
  return {
    targetUrl,
    finalUrl,
    mode: "http",
    warnings: [
      "Limited HTTP inspection: JavaScript was not executed. Dynamic requests, CSS dependencies and browser rendering are excluded. Timings describe server fetches, not page load speed. Sizes are decoded response bytes.",
      ...(resources.size > 30
        ? ["Only the first 30 static resources were inspected."]
        : []),
    ],
    timing: {
      navigationStart: 0,
      firstRequestTime: 0,
      lastResponseTime: totalLoadTime,
      totalLoadTime,
    },
    rawEvents: rawEvents.sort((a, b) => a.startTime - b.startTime),
  };
}

async function readLimitedBody(
  response: Response,
  limit: number,
): Promise<Uint8Array> {
  const reader = response.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit)
        throw new Error("Response exceeded inspection size limit");
      chunks.push(value);
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}
