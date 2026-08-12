import { NetworkRequest } from '../../types/network';
import { PerformanceIssue } from '../../types/issues';
import { formatBytes } from '../../lib/format';

export function analyzeThirdPartyRequests(requests: NetworkRequest[]): PerformanceIssue | null {
  const thirdPartyRequests = requests.filter((r) => r.isThirdParty);

  if (thirdPartyRequests.length === 0) return null;

  const totalCount = thirdPartyRequests.length;
  const ratio = totalCount / requests.length;

  if (ratio < 0.25 && totalCount < 15) return null;

  const totalBytes = thirdPartyRequests.reduce((sum, r) => sum + r.transferSize, 0);
  const affectedIds = thirdPartyRequests.map((r) => r.id);

  const uniqueDomains = Array.from(new Set(thirdPartyRequests.map((r) => r.domain))).length;

  return {
    id: 'issue-third-party',
    severity: ratio > 0.5 || totalCount > 30 ? 'warning' : 'info',
    category: 'third-party',
    title: `High Third-Party Dependency Overhead (${totalCount} requests from ${uniqueDomains} domains)`,
    description: `${(ratio * 100).toFixed(0)}% of all page requests (${totalCount} of ${requests.length}, transferring ${formatBytes(totalBytes)}) are handled by third-party host domains.`,
    recommendation: 'Audit third-party analytics, tracking scripts, and widget embeds. Defer non-critical external scripts.',
    affectedRequests: affectedIds,
    metric: {
      value: totalCount,
      unit: 'requests',
    },
  };
}
