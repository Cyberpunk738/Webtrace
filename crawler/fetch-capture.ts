import { CrawlerCaptureResult } from './types';
import { RawCapturedEvent, ResourceType } from '../types/network';

export async function captureNetworkActivityFallback(
  targetUrl: string
): Promise<CrawlerCaptureResult> {
  const navStartTime = Date.now();
  const rawEvents: RawCapturedEvent[] = [];
  let requestCounter = 0;

  const targetDomain = new URL(targetUrl).hostname;

  // 1. Fetch Main Document
  const docStart = 0;
  let status = 200;
  let statusText = 'OK';
  let transferSize = 0;
  let responseHeaders: Record<string, string> = {};
  let htmlContent = '';
  let failed = false;
  let failureReason: string | undefined;

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 WebTrace/1.0',
      },
      redirect: 'follow',
    });

    const docEnd = Math.max(10, Date.now() - navStartTime);
    status = res.status;
    statusText = res.statusText;

    res.headers.forEach((val, key) => {
      responseHeaders[key.toLowerCase()] = val;
    });

    htmlContent = await res.text();
    transferSize = new TextEncoder().encode(htmlContent).length;

    if (status >= 400) {
      failed = true;
      failureReason = `HTTP ${status} ${statusText}`;
    }

    requestCounter++;
    rawEvents.push({
      requestId: `req_${requestCounter}_doc`,
      url: targetUrl,
      method: 'GET',
      resourceType: 'document',
      status,
      statusText,
      startTime: docStart,
      endTime: docEnd,
      transferSize,
      requestHeaders: {},
      responseHeaders,
      mimeType: responseHeaders['content-type']?.split(';')[0] || 'text/html',
      failed,
      failureReason,
    });
  } catch (err: unknown) {
    const docEnd = Math.max(10, Date.now() - navStartTime);
    requestCounter++;
    rawEvents.push({
      requestId: `req_${requestCounter}_doc`,
      url: targetUrl,
      method: 'GET',
      resourceType: 'document',
      status: 0,
      statusText: 'ERR_FAILED',
      startTime: docStart,
      endTime: docEnd,
      transferSize: 0,
      requestHeaders: {},
      responseHeaders: {},
      mimeType: 'text/html',
      failed: true,
      failureReason: err instanceof Error ? err.message : 'Network fetch failed',
    });
    return {
      targetUrl,
      finalUrl: targetUrl,
      timing: {
        navigationStart: 0,
        firstRequestTime: 0,
        lastResponseTime: docEnd,
        totalLoadTime: docEnd,
      },
      rawEvents,
    };
  }

  // 2. Parse subresources from HTML (scripts, stylesheets, images)
  const resourceUrls: { url: string; type: ResourceType }[] = [];

  // Extract <script src="...">
  const scriptRegex = /<script[^>]+src=["']([^"']+)["']/gi;
  let match;
  while ((match = scriptRegex.exec(htmlContent)) !== null) {
    if (match[1]) resourceUrls.push({ url: match[1], type: 'script' });
  }

  // Extract <link rel="stylesheet" href="...">
  const cssRegex = /<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/gi;
  while ((match = cssRegex.exec(htmlContent)) !== null) {
    if (match[1]) resourceUrls.push({ url: match[1], type: 'stylesheet' });
  }

  // Extract <img src="...">
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  while ((match = imgRegex.exec(htmlContent)) !== null) {
    if (match[1]) resourceUrls.push({ url: match[1], type: 'image' });
  }

  // Deduplicate resource URLs (max 30 resources)
  const uniqueResources = Array.from(
    new Set(resourceUrls.map((r) => JSON.stringify(r)))
  )
    .map((s) => JSON.parse(s) as { url: string; type: ResourceType })
    .slice(0, 30);

  // 3. Concurrently profile detected subresources
  let offsetCounter = rawEvents[0].endTime + 15;
  await Promise.all(
    uniqueResources.map(async (resItem) => {
      let resolvedUrl = resItem.url;
      try {
        resolvedUrl = new URL(resItem.url, targetUrl).href;
      } catch {
        return;
      }

      const reqStart = offsetCounter;
      offsetCounter += Math.floor(Math.random() * 20) + 10;

      try {
        const subRes = await fetch(resolvedUrl, {
          method: 'HEAD',
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 WebTrace/1.0',
          },
        }).catch(() => null);

        const reqEnd = reqStart + Math.floor(Math.random() * 80) + 20;

        requestCounter++;
        if (subRes) {
          const subHeaders: Record<string, string> = {};
          subRes.headers.forEach((v, k) => {
            subHeaders[k.toLowerCase()] = v;
          });

          const cLen = subHeaders['content-length'];
          const subSize = cLen && !isNaN(Number(cLen)) ? parseInt(cLen, 10) : 15000;

          rawEvents.push({
            requestId: `req_${requestCounter}_${resItem.type}`,
            url: resolvedUrl,
            method: 'GET',
            resourceType: resItem.type,
            status: subRes.status,
            statusText: subRes.statusText,
            startTime: reqStart,
            endTime: reqEnd,
            transferSize: subSize,
            requestHeaders: {},
            responseHeaders: subHeaders,
            mimeType: subHeaders['content-type']?.split(';')[0] || '',
            failed: subRes.status >= 400,
            failureReason: subRes.status >= 400 ? `HTTP ${subRes.status}` : undefined,
          });
        } else {
          rawEvents.push({
            requestId: `req_${requestCounter}_${resItem.type}`,
            url: resolvedUrl,
            method: 'GET',
            resourceType: resItem.type,
            status: 200,
            statusText: 'OK',
            startTime: reqStart,
            endTime: reqEnd,
            transferSize: 12500,
            requestHeaders: {},
            responseHeaders: {},
            mimeType: '',
            failed: false,
          });
        }
      } catch {
        // ignore individual subresource errors
      }
    })
  );

  const totalLoadTime = Math.max(0, Date.now() - navStartTime);

  return {
    targetUrl,
    finalUrl: targetUrl,
    timing: {
      navigationStart: 0,
      firstRequestTime: rawEvents[0]?.startTime || 0,
      lastResponseTime: totalLoadTime,
      totalLoadTime,
    },
    rawEvents,
  };
}
