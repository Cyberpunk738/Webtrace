import { NetworkRequest } from '../../types/network';
import { PerformanceIssue } from '../../types/issues';
import { formatBytes } from '../../lib/format';

export function analyzeLargeCSS(requests: NetworkRequest[]): PerformanceIssue | null {
  const largeCss = requests.filter(
    (r) => r.resourceType === 'stylesheet' && r.transferSize > 200 * 1024
  );

  if (largeCss.length === 0) return null;

  const affectedIds = largeCss.map((r) => r.id);
  const totalBytes = largeCss.reduce((sum, r) => sum + r.transferSize, 0);

  return {
    id: 'issue-large-css',
    severity: totalBytes > 600 * 1024 ? 'critical' : 'warning',
    category: 'css',
    title: `Large CSS Stylesheet Payload (${largeCss.length} file${largeCss.length > 1 ? 's' : ''})`,
    description: `Detected ${largeCss.length} CSS resource(s) exceeding 200 KB (totaling ${formatBytes(totalBytes)}). Render-blocking CSS delays First Contentful Paint.`,
    recommendation: 'Purge unused CSS styles, inline critical CSS, and split stylesheet rules by view route.',
    affectedRequests: affectedIds,
    metric: {
      value: totalBytes,
      unit: 'bytes',
    },
  };
}
