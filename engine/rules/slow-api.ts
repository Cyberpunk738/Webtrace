import { NetworkRequest } from '../../types/network';
import { PerformanceIssue } from '../../types/issues';
import { formatDuration } from '../../lib/format';

export function analyzeSlowAPI(requests: NetworkRequest[]): PerformanceIssue | null {
  const slowApis = requests.filter(
    (r) => (r.resourceType === 'xhr' || r.resourceType === 'fetch') && r.duration > 1000
  );

  if (slowApis.length === 0) return null;

  const affectedIds = slowApis.map((r) => r.id);
  const maxDuration = Math.max(...slowApis.map((r) => r.duration));

  return {
    id: 'issue-slow-api',
    severity: maxDuration > 2500 ? 'critical' : 'warning',
    category: 'api',
    title: `Slow Dynamic API Endpoint Responses (${slowApis.length} call${slowApis.length > 1 ? 's' : ''})`,
    description: `Identified ${slowApis.length} dynamic XHR/Fetch request(s) taking over 1,000 ms to respond (slowest API took ${formatDuration(maxDuration)}).`,
    recommendation: 'Optimize backend query execution, add API response caching layer, or implement parallelized data fetching.',
    affectedRequests: affectedIds,
    metric: {
      value: maxDuration,
      unit: 'ms',
    },
  };
}
