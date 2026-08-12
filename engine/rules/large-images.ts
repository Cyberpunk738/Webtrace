import { NetworkRequest } from '../../types/network';
import { PerformanceIssue } from '../../types/issues';
import { formatBytes } from '../../lib/format';

export function analyzeLargeImages(requests: NetworkRequest[]): PerformanceIssue | null {
  const largeImages = requests.filter(
    (r) => r.resourceType === 'image' && r.transferSize > 200 * 1024
  );

  if (largeImages.length === 0) return null;

  const affectedIds = largeImages.map((r) => r.id);
  const totalImageBytes = largeImages.reduce((sum, r) => sum + r.transferSize, 0);

  return {
    id: 'issue-large-images',
    severity: totalImageBytes > 2 * 1024 * 1024 ? 'critical' : 'warning',
    category: 'images',
    title: `Unoptimized Image Payloads (${largeImages.length} image${largeImages.length > 1 ? 's' : ''})`,
    description: `Detected ${largeImages.length} image resource(s) larger than 200 KB, consuming a total of ${formatBytes(totalImageBytes)}. Uncompressed images delay page rendering and consume excess bandwidth.`,
    recommendation: 'Convert legacy image formats to modern WebP or AVIF, compress image payloads, and use responsive srcset attributes.',
    affectedRequests: affectedIds,
    metric: {
      value: totalImageBytes,
      unit: 'bytes',
    },
  };
}
