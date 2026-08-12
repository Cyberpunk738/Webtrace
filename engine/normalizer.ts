import { RawCapturedEvent, NetworkRequest, ResourceType } from '../types/network';
import { extractDomain, isThirdPartyDomain } from '../lib/url';

export function normalizeCapturedEvents(
  events: RawCapturedEvent[],
  targetDomain: string
): NetworkRequest[] {
  return events.map((event) => {
    const domain = extractDomain(event.url);
    const resourceType = mapResourceType(event.resourceType, event.mimeType);
    const duration = Math.max(0, event.endTime - event.startTime);
    const isThirdParty = isThirdPartyDomain(domain, targetDomain);

    return {
      id: event.requestId,
      url: event.url,
      method: event.method.toUpperCase(),
      status: event.status,
      statusText: event.statusText,
      resourceType,
      domain,
      startTime: Math.round(event.startTime),
      endTime: Math.round(event.endTime),
      duration: Math.round(duration),
      transferSize: event.transferSize || 0,
      requestHeaders: event.requestHeaders,
      responseHeaders: event.responseHeaders,
      mimeType: event.mimeType,
      cached: event.status === 304,
      failed: event.failed,
      failureReason: event.failureReason,
      isThirdParty,
    };
  });
}

function mapResourceType(pwResourceType: string, mimeType?: string): ResourceType {
  const type = pwResourceType.toLowerCase();
  const mime = (mimeType || '').toLowerCase();

  if (type === 'document' || mime.includes('html')) return 'document';
  if (type === 'stylesheet' || mime.includes('css')) return 'stylesheet';
  if (type === 'script' || mime.includes('javascript') || mime.includes('ecmascript')) return 'script';
  if (
    type === 'image' ||
    mime.includes('image') ||
    mime.includes('svg') ||
    mime.includes('png') ||
    mime.includes('jpeg') ||
    mime.includes('webp') ||
    mime.includes('avif') ||
    mime.includes('gif')
  ) {
    return 'image';
  }
  if (type === 'font' || mime.includes('font') || mime.includes('woff')) return 'font';
  if (type === 'xhr') return 'xhr';
  if (type === 'fetch') return 'fetch';
  if (type === 'media' || mime.includes('video') || mime.includes('audio')) return 'media';

  return 'other';
}
