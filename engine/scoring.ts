import { NetworkRequest } from '../types/network';
import { PerformanceIssue } from '../types/issues';

export interface ScoreDetails {
  score: number;
  category: 'Excellent' | 'Good' | 'Needs Improvement' | 'Poor';
}

export function calculatePerformanceScore(
  requests: NetworkRequest[],
  issues: PerformanceIssue[]
): ScoreDetails {
  let score = 100;

  for (const issue of issues) {
    switch (issue.id) {
      case 'issue-large-javascript':
        score -= issue.severity === 'critical' ? 15 : 8;
        break;
      case 'issue-large-images':
        score -= issue.severity === 'critical' ? 12 : 6;
        break;
      case 'issue-slow-requests':
        score -= issue.severity === 'critical' ? 12 : 6;
        break;
      case 'issue-failed-requests':
        const failedCount = issue.metric?.value || 1;
        score -= Math.min(25, failedCount * 5);
        break;
      case 'issue-high-request-count':
        score -= issue.severity === 'critical' ? 15 : 8;
        break;
      case 'issue-third-party':
        score -= issue.severity === 'warning' ? 8 : 4;
        break;
      case 'issue-heavy-page':
        score -= issue.severity === 'critical' ? 15 : 8;
        break;
      case 'issue-slow-api':
        score -= issue.severity === 'critical' ? 12 : 6;
        break;
      case 'issue-duplicate-requests':
        score -= 5;
        break;
      case 'issue-large-css':
        score -= issue.severity === 'critical' ? 10 : 5;
        break;
      default:
        score -= 5;
    }
  }

  // Ensure bounded 0 - 100
  const finalScore = Math.max(0, Math.min(100, Math.round(score)));

  let category: 'Excellent' | 'Good' | 'Needs Improvement' | 'Poor';
  if (finalScore >= 90) category = 'Excellent';
  else if (finalScore >= 75) category = 'Good';
  else if (finalScore >= 50) category = 'Needs Improvement';
  else category = 'Poor';

  return {
    score: finalScore,
    category,
  };
}
