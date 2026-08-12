import { NetworkRequest } from '../../types/network';
import { PerformanceIssue } from '../../types/issues';

import { analyzeLargeJavaScript } from './large-javascript';
import { analyzeLargeImages } from './large-images';
import { analyzeSlowRequests } from './slow-requests';
import { analyzeFailedRequests } from './failed-requests';
import { analyzeRequestCount } from './request-count';
import { analyzeThirdPartyRequests } from './third-party';
import { analyzeHeavyPage } from './large-page';
import { analyzeSlowAPI } from './slow-api';
import { analyzeDuplicateRequests } from './duplicate-requests';
import { analyzeLargeCSS } from './large-css';

export function runAllRules(requests: NetworkRequest[]): PerformanceIssue[] {
  const rules = [
    analyzeLargeJavaScript,
    analyzeLargeImages,
    analyzeSlowRequests,
    analyzeFailedRequests,
    analyzeRequestCount,
    analyzeThirdPartyRequests,
    analyzeHeavyPage,
    analyzeSlowAPI,
    analyzeDuplicateRequests,
    analyzeLargeCSS,
  ];

  const issues: PerformanceIssue[] = [];

  for (const rule of rules) {
    try {
      const issue = rule(requests);
      if (issue) {
        issues.push(issue);
      }
    } catch {
      // rule safety fallback
    }
  }

  return issues;
}
