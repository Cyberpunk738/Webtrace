import { NetworkRequest } from '../../types/network';
import { PerformanceIssue } from '../../types/issues';

export function analyzeFailedRequests(requests: NetworkRequest[]): PerformanceIssue | null {
  const failedRequests = requests.filter((r) => r.failed || (r.status && r.status >= 400));

  if (failedRequests.length === 0) return null;

  const affectedIds = failedRequests.map((r) => r.id);

  return {
    id: 'issue-failed-requests',
    severity: 'critical',
    category: 'requests',
    title: `Failed Network Requests Detected (${failedRequests.length})`,
    description: `Encountered ${failedRequests.length} HTTP request(s) returning 4xx/5xx status codes or suffering network connection errors.`,
    recommendation: 'Fix broken links, verify backend API endpoint routes, and resolve missing static assets or CORS restrictions.',
    affectedRequests: affectedIds,
    metric: {
      value: failedRequests.length,
      unit: 'requests',
    },
  };
}
