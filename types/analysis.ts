import { NetworkRequest } from './network';
import { PerformanceIssue } from './issues';

export interface AnalysisSummary {
  score: number;
  scoreCategory: 'Excellent' | 'Good' | 'Needs Improvement' | 'Poor';
  requestCount: number;
  totalTransferSize: number;
  totalDuration: number;
  failedRequests: number;
  thirdPartyRequests: number;
}

export interface ResourceBreakdown {
  document: number;
  scripts: number;
  stylesheets: number;
  images: number;
  fonts: number;
  api: number;
  other: number;
}

export interface AnalysisTiming {
  navigationStart: number;
  firstRequest: number;
  lastResponse: number;
  totalLoadTime: number;
}

export interface AnalysisResult {
  url: string;
  domain: string;
  timestamp: string;
  summary: AnalysisSummary;
  resources: ResourceBreakdown;
  requests: NetworkRequest[];
  issues: PerformanceIssue[];
  timing: AnalysisTiming;
}
