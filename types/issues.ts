export type IssueSeverity = 'critical' | 'warning' | 'info';

export type IssueCategory =
  | 'javascript'
  | 'images'
  | 'css'
  | 'network'
  | 'requests'
  | 'third-party'
  | 'api'
  | 'general';

export interface PerformanceIssue {
  id: string;
  severity: IssueSeverity;
  category: IssueCategory;
  title: string;
  description: string;
  recommendation: string;
  affectedRequests?: string[];
  metric?: {
    value: number;
    unit: string;
  };
}
