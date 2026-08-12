import { NetworkRequest } from '../../types/network';
import { PerformanceIssue } from '../../types/issues';

export function analyzeRequestCount(requests: NetworkRequest[], threshold = 100): PerformanceIssue | null {
  const totalCount = requests.length;

  if (totalCount <= threshold) return null;

  return {
    id: 'issue-high-request-count',
    severity: totalCount > 180 ? 'critical' : 'warning',
    category: 'requests',
    title: `Excessive HTTP Requests (${totalCount} requests)`,
    description: `The page executed ${totalCount} HTTP requests during load, exceeding the recommended limit of ${threshold} requests. High request overhead strains connection concurrency limits.`,
    recommendation: 'Bundle JavaScript and CSS assets, inline small icon SVGs, and combine network requests where appropriate.',
    metric: {
      value: totalCount,
      unit: 'requests',
    },
  };
}
