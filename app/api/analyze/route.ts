import { NextRequest, NextResponse } from 'next/server';
import { validateAndNormalizeUrl } from '@/lib/url';
import { captureNetworkActivity } from '@/crawler/capture';
import { captureNetworkActivityFallback } from '@/crawler/fetch-capture';
import { normalizeCapturedEvents } from '@/engine/normalizer';
import { runPerformanceAnalysis } from '@/engine/analyzer';

export const maxDuration = 60; // max duration for Vercel functions

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'A valid target website URL is required.' },
        { status: 400 }
      );
    }

    const validation = validateAndNormalizeUrl(url);
    if (!validation.valid || !validation.normalizedUrl || !validation.domain) {
      return NextResponse.json(
        { success: false, error: validation.error || 'Invalid or restricted URL.' },
        { status: 400 }
      );
    }

    const targetUrl = validation.normalizedUrl;
    const targetDomain = validation.domain;

    let captureResult;
    try {
      // Try Playwright Chromium network capture first
      captureResult = await captureNetworkActivity(targetUrl, {
        timeoutMs: 20000,
      });
    } catch (captureErr) {
      console.warn('Playwright capture failed or unsupported in host environment. Triggering HTTP telemetry fallback...', captureErr);
      try {
        // Fall back to server-side HTTP fetch telemetry capturer
        captureResult = await captureNetworkActivityFallback(targetUrl);
      } catch (fallbackErr: unknown) {
        const errorMsg = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
        
        let userFriendlyError = 'WebTrace encountered an error analyzing this website.';
        if (errorMsg.includes('Timeout') || errorMsg.includes('ERR_TIMED_OUT')) {
          userFriendlyError = 'The website took too long to respond (Navigation Timeout).';
        } else if (errorMsg.includes('ERR_NAME_NOT_RESOLVED') || errorMsg.includes('ERR_CONNECTION_REFUSED') || errorMsg.includes('fetch failed')) {
          userFriendlyError = "WebTrace couldn't reach this website. The site may be offline or unavailable.";
        }

        return NextResponse.json(
          { success: false, error: userFriendlyError },
          { status: 502 }
        );
      }
    }

    const normalizedRequests = normalizeCapturedEvents(captureResult.rawEvents, targetDomain);
    const analysisResult = runPerformanceAnalysis(targetUrl, normalizedRequests, {
      navigationStart: captureResult.timing.navigationStart,
      firstRequest: captureResult.timing.firstRequestTime,
      lastResponse: captureResult.timing.lastResponseTime,
      totalLoadTime: captureResult.timing.totalLoadTime,
    });

    return NextResponse.json({ success: true, result: analysisResult });
  } catch {
    return NextResponse.json(
      { success: false, error: 'An unexpected server error occurred.' },
      { status: 500 }
    );
  }
}
