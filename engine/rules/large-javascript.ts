import { NetworkRequest } from '../../types/network';
import { PerformanceIssue } from '../../types/issues';
import { formatBytes } from '../../lib/format';

export function analyzeLargeJavaScript(requests: NetworkRequest[]): PerformanceIssue | null {
  const jsRequests = requests.filter(
    (r) => r.resourceType === 'script' && r.transferSize > 500 * 1024
  );

  if (jsRequests.length === 0) return null;

  const affectedIds = jsRequests.map((r) => r.id);
  const totalLargeJsBytes = jsRequests.reduce((sum, r) => sum + r.transferSize, 0);
  const maxSingle = Math.max(...jsRequests.map((r) => r.transferSize));

  const isCritical = maxSingle > 1024 * 1024 || jsRequests.length >= 3;

  return {
    id: 'issue-large-javascript',
    severity: isCritical ? 'critical' : 'warning',
    category: 'javascript',
    title: `Large JavaScript Payloads Detected (${jsRequests.length} file${jsRequests.length > 1 ? 's' : ''})`,
    description: `Found ${jsRequests.length} JavaScript resource(s) exceeding 500 KB (totaling ${formatBytes(totalLargeJsBytes)}). Large JS bundles increase parse and execution time, blocking the main browser thread.`,
    recommendation: 'Implement route-based code splitting, enable tree shaking, and lazy-load non-critical module bundles.',
    affectedRequests: affectedIds,
    metric: {
      value: totalLargeJsBytes,
      unit: 'bytes',
    },
  };
}
