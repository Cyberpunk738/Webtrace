import { NextRequest, NextResponse } from 'next/server';
import { validateAndNormalizeUrl } from '@/lib/url';
import { captureNetworkActivity } from '@/crawler/capture';
import { normalizeCapturedEvents } from '@/engine/normalizer';
import { runPerformanceAnalysis } from '@/engine/analyzer';

export const maxDuration = 60; // allowable timeout on modern serverless/Node

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

    try {
      const captureResult = await captureNetworkActivity(targetUrl, {
        timeoutMs: 25000,
      });

      const normalizedRequests = normalizeCapturedEvents(captureResult.rawEvents, targetDomain);
      const analysisResult = runPerformanceAnalysis(targetUrl, normalizedRequests, {
        navigationStart: captureResult.timing.navigationStart,
        firstRequest: captureResult.timing.firstRequestTime,
        lastResponse: captureResult.timing.lastResponseTime,
        totalLoadTime: captureResult.timing.totalLoadTime,
      });

      return NextResponse.json({ success: true, result: analysisResult });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      
      let userFriendlyError = 'WebTrace encountered an error analyzing this website.';
      if (errorMsg.includes('Timeout') || errorMsg.includes('ERR_TIMED_OUT')) {
        userFriendlyError = 'The website took too long to respond (Navigation Timeout).';
      } else if (errorMsg.includes('ERR_NAME_NOT_RESOLVED') || errorMsg.includes('ERR_CONNECTION_REFUSED')) {
        userFriendlyError = "WebTrace couldn't reach this website. The site may be offline or unavailable.";
      }

      return NextResponse.json(
        { success: false, error: userFriendlyError },
        { status: 502 }
      );
    }
  } catch {
    return NextResponse.json(
      { success: false, error: 'An unexpected server error occurred.' },
      { status: 500 }
    );
  }
}
