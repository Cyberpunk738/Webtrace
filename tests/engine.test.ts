import { runPerformanceAnalysis } from '../engine/analyzer';
import { NetworkRequest } from '../types/network';

// Helper mock builder
function createMockRequest(overrides: Partial<NetworkRequest>): NetworkRequest {
  return {
    id: `req-${Math.random().toString(36).substring(2, 6)}`,
    url: 'https://example.com/asset.js',
    method: 'GET',
    status: 200,
    resourceType: 'script',
    domain: 'example.com',
    startTime: 10,
    endTime: 200,
    duration: 190,
    transferSize: 50000,
    isThirdParty: false,
    failed: false,
    ...overrides,
  };
}

export function runEngineTests(): { passed: boolean; report: string[] } {
  const report: string[] = [];
  let passed = true;

  const log = (msg: string) => report.push(msg);

  // Test 1: Small fast website
  {
    const reqs = [
      createMockRequest({ url: 'https://example.com/', resourceType: 'document', transferSize: 15000 }),
      createMockRequest({ url: 'https://example.com/main.js', resourceType: 'script', transferSize: 45000 }),
      createMockRequest({ url: 'https://example.com/style.css', resourceType: 'stylesheet', transferSize: 12000 }),
    ];
    const res = runPerformanceAnalysis('https://example.com', reqs, {
      navigationStart: 0,
      firstRequest: 10,
      lastResponse: 200,
      totalLoadTime: 200,
    });

    if (res.summary.score === 100 && res.issues.length === 0) {
      log('✓ Test 1 Passed: Small fast website scores 100/100 with zero issues.');
    } else {
      passed = false;
      log(`x Test 1 Failed: Expected score 100, got ${res.summary.score}.`);
    }
  }

  // Test 2: Large JavaScript website
  {
    const reqs = [
      createMockRequest({ url: 'https://example.com/bundle.js', resourceType: 'script', transferSize: 1200000 }),
    ];
    const res = runPerformanceAnalysis('https://example.com', reqs, {
      navigationStart: 0,
      firstRequest: 10,
      lastResponse: 500,
      totalLoadTime: 500,
    });

    const hasJsIssue = res.issues.some((i) => i.id === 'issue-large-javascript');
    if (hasJsIssue && res.summary.score < 100) {
      log(`✓ Test 2 Passed: Large JS website detected issue and reduced score to ${res.summary.score}.`);
    } else {
      passed = false;
      log('x Test 2 Failed: Did not detect large JS issue.');
    }
  }

  // Test 3: Failed Requests website
  {
    const reqs = [
      createMockRequest({ url: 'https://example.com/404.jpg', status: 404, failed: true, failureReason: 'HTTP 404' }),
    ];
    const res = runPerformanceAnalysis('https://example.com', reqs, {
      navigationStart: 0,
      firstRequest: 10,
      lastResponse: 300,
      totalLoadTime: 300,
    });

    const hasFailIssue = res.issues.some((i) => i.id === 'issue-failed-requests');
    if (hasFailIssue && res.summary.failedRequests === 1) {
      log('✓ Test 3 Passed: Failed request detected and logged in summary metrics.');
    } else {
      passed = false;
      log('x Test 3 Failed: Failed request not properly counted.');
    }
  }

  return { passed, report };
}
