import { NetworkRequest } from '../../types/network';
import { PerformanceIssue } from '../../types/issues';
import { formatDuration } from '../../lib/format';

export function analyzeSlowRequests(requests: NetworkRequest[]): PerformanceIssue | null {
  const slowRequests = requests.filter((r) => r.duration > 1000 && !r.failed);

  if (slowRequests.length === 0) return null;

  const affectedIds = slowRequests.map((r) => r.id);
  const maxDuration = Math.max(...slowRequests.map((r) => r.duration));

  return {
    id: 'issue-slow-requests',
    severity: maxDuration > 3000 ? 'critical' : 'warning',
    category: 'network',
    title: `High Latency Network Requests (${slowRequests.length} request${slowRequests.length > 1 ? 's' : ''})`,
    description: `Found ${slowRequests.length} request(s) taking longer than 1,000 ms to respond. Peak request duration reached ${formatDuration(maxDuration)}.`,
    recommendation: 'Check server response times, enable CDN caching, optimize database queries, or preload essential assets.',
    affectedRequests: affectedIds,
    metric: {
      value: maxDuration,
      unit: 'ms',
    },
  };
}
