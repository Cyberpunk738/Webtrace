import { NetworkRequest } from '../../types/network';
import { PerformanceIssue } from '../../types/issues';
import { formatBytes } from '../../lib/format';

export function analyzeHeavyPage(requests: NetworkRequest[], thresholdBytes = 5 * 1024 * 1024): PerformanceIssue | null {
  const totalTransfer = requests.reduce((sum, r) => sum + r.transferSize, 0);

  if (totalTransfer <= thresholdBytes) return null;

  return {
    id: 'issue-heavy-page',
    severity: totalTransfer > 10 * 1024 * 1024 ? 'critical' : 'warning',
    category: 'general',
    title: `Heavy Overall Page Weight (${formatBytes(totalTransfer)})`,
    description: `Total network data payload transferred is ${formatBytes(totalTransfer)}, exceeding the recommended maximum threshold of 5 MB.`,
    recommendation: 'Compress video and image assets, strip unneeded font weights, and implement Gzip/Brotli HTTP compression.',
    metric: {
      value: totalTransfer,
      unit: 'bytes',
    },
  };
}
