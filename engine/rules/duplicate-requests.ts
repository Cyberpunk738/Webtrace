import { NetworkRequest } from '../../types/network';
import { PerformanceIssue } from '../../types/issues';

export function analyzeDuplicateRequests(requests: NetworkRequest[]): PerformanceIssue | null {
  const urlCounts = new Map<string, string[]>();

  for (const r of requests) {
    // Only track GET requests for static assets or non-polling URLs
    if (r.method === 'GET' && r.resourceType !== 'xhr' && r.resourceType !== 'fetch') {
      const existing = urlCounts.get(r.url) || [];
      existing.push(r.id);
      urlCounts.set(r.url, existing);
    }
  }

  const duplicates: { url: string; ids: string[] }[] = [];
  for (const [url, ids] of urlCounts.entries()) {
    if (ids.length > 1) {
      duplicates.push({ url, ids });
    }
  }

  if (duplicates.length === 0) return null;

  const allAffectedIds = duplicates.flatMap((d) => d.ids);

  return {
    id: 'issue-duplicate-requests',
    severity: 'warning',
    category: 'requests',
    title: `Duplicate Static Asset Requests Detected (${duplicates.length} duplicate URL${duplicates.length > 1 ? 's' : ''})`,
    description: `Found ${duplicates.length} identical static resource URL(s) requested multiple times during initial page load.`,
    recommendation: 'Ensure proper HTTP caching headers are set and fix multiple redundant script/stylesheet injections.',
    affectedRequests: allAffectedIds,
    metric: {
      value: duplicates.length,
      unit: 'urls',
    },
  };
}
