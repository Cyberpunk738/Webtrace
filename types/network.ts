export type ResourceType =
  | 'document'
  | 'stylesheet'
  | 'script'
  | 'image'
  | 'font'
  | 'xhr'
  | 'fetch'
  | 'media'
  | 'other';

export interface NetworkRequest {
  id: string;
  url: string;
  method: string;
  status: number | null;
  statusText?: string;
  resourceType: ResourceType;
  domain: string;
  startTime: number; // relative time in ms from navigation start
  endTime: number;   // relative time in ms from navigation start
  duration: number;  // in ms
  transferSize: number; // in bytes
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
  mimeType?: string;
  cached?: boolean;
  failed?: boolean;
  failureReason?: string;
  isThirdParty?: boolean;
}

export interface RawCapturedEvent {
  requestId: string;
  url: string;
  method: string;
  resourceType: string;
  status: number | null;
  statusText?: string;
  startTime: number;
  endTime: number;
  transferSize: number;
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
  mimeType?: string;
  failed: boolean;
  failureReason?: string;
}
