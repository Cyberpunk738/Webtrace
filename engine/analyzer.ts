import { NetworkRequest } from '../types/network';
import { AnalysisResult, ResourceBreakdown, AnalysisTiming } from '../types/analysis';
import { runAllRules } from './rules';
import { calculatePerformanceScore } from './scoring';
import { extractDomain } from '../lib/url';

export function runPerformanceAnalysis(
  url: string,
  requests: NetworkRequest[],
  timing: AnalysisTiming
): AnalysisResult {
  const domain = extractDomain(url);
  const issues = runAllRules(requests);
  const scoreDetails = calculatePerformanceScore(requests, issues);

  const totalTransferSize = requests.reduce((sum, r) => sum + r.transferSize, 0);
  const failedRequestsCount = requests.filter((r) => r.failed || (r.status && r.status >= 400)).length;
  const thirdPartyRequestsCount = requests.filter((r) => r.isThirdParty).length;

  const resources: ResourceBreakdown = {
    document: 0,
    scripts: 0,
    stylesheets: 0,
    images: 0,
    fonts: 0,
    api: 0,
    other: 0,
  };

  for (const req of requests) {
    switch (req.resourceType) {
      case 'document':
        resources.document++;
        break;
      case 'script':
        resources.scripts++;
        break;
      case 'stylesheet':
        resources.stylesheets++;
        break;
      case 'image':
        resources.images++;
        break;
      case 'font':
        resources.fonts++;
        break;
      case 'xhr':
      case 'fetch':
        resources.api++;
        break;
      default:
        resources.other++;
    }
  }

  return {
    url,
    domain,
    timestamp: new Date().toISOString(),
    summary: {
      score: scoreDetails.score,
      scoreCategory: scoreDetails.category,
      requestCount: requests.length,
      totalTransferSize,
      totalDuration: timing.totalLoadTime,
      failedRequests: failedRequestsCount,
      thirdPartyRequests: thirdPartyRequestsCount,
    },
    resources,
    requests,
    issues,
    timing,
  };
}
