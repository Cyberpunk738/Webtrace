import { RawCapturedEvent } from '../types/network';

export interface CrawlerProgress {
  stage: 'launching' | 'loading' | 'capturing' | 'analyzing' | 'complete' | 'error';
  message: string;
  timestamp: number;
}

export interface CrawlerOptions {
  timeoutMs?: number;
  viewport?: { width: number; height: number };
  userAgent?: string;
  onProgress?: (progress: CrawlerProgress) => void;
}

export interface CrawlerCaptureResult {
  targetUrl: string;
  finalUrl: string;
  timing: {
    navigationStart: number;
    firstRequestTime: number;
    lastResponseTime: number;
    totalLoadTime: number;
  };
  rawEvents: RawCapturedEvent[];
}
