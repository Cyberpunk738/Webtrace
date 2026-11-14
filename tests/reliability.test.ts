import { test, mock, afterEach } from "node:test";
import assert from "node:assert/strict";
import { validateAndNormalizeUrl, isPrivateOrLocalIP } from "../lib/url";
import { captureNetworkActivityFallback } from "../crawler/fetch-capture";
import { safeFetch } from "../lib/safe-fetch";
import { useAnalysisStore } from "../store/analysis-store";
import { portableReport, previousComparable, requestCsv } from "../lib/reports";
import { runPerformanceAnalysis } from "../engine/analyzer";
import { normalizeCapturedEvents } from "../engine/normalizer";

const report = () =>
  runPerformanceAnalysis("https://93.184.216.34/", [], {
    navigationStart: 0,
    firstRequest: 0,
    lastResponse: 10,
    totalLoadTime: 10,
  });
// No network required: public literal IPs bypass DNS while fetch is mocked.
afterEach(() => {
  useAnalysisStore.getState().reset();
  mock.restoreAll();
});

test("URL validation blocks alternate protocols, credentials and restricted address formats", () => {
  for (const url of [
    "file:///etc/passwd",
    "ftp://example.com",
    "https://user:pass@example.com",
    "http://2130706433",
    "http://[::ffff:127.0.0.1]",
    "http://[fc00::1]",
    "http://100.64.0.1",
    "http://169.254.169.254",
  ])
    assert.equal(validateAndNormalizeUrl(url).valid, false, url);
  assert.equal(
    validateAndNormalizeUrl(" example.com ").normalizedUrl,
    "https://example.com/",
  );
  assert.equal(isPrivateOrLocalIP("::ffff:7f00:1"), true);
  assert.equal(
    validateAndNormalizeUrl("example.com:8080").normalizedUrl,
    "https://example.com:8080/",
  );
  assert.equal(
    validateAndNormalizeUrl("https://[2606:4700:4700::1111]").valid,
    true,
  );
});

test("redirects to private destinations are blocked before fetch", async () => {
  const fetchMock = mock.method(
    globalThis,
    "fetch",
    async () =>
      new Response(null, {
        status: 302,
        headers: { location: "http://127.0.0.1/secrets" },
      }),
  );
  await assert.rejects(() => safeFetch("https://93.184.216.34"), /restricted/);
  assert.equal(fetchMock.mock.callCount(), 1);
});

test("HTTP inspection measures completed bodies, real failures and deduplicated resources", async () => {
  mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = String(input);
    if (url.endsWith("/"))
      return new Response(
        '<script src="/app.js"></script><script src="/app.js"></script><img src="/bad.png"><link href="/style.css" rel="stylesheet">',
        { headers: { "content-type": "text/html" } },
      );
    if (url.endsWith("bad.png")) throw new Error("Connection refused");
    // Wait for the stream body, rather than measuring only headers.
    return new Response(
      new ReadableStream({
        async start(controller) {
          await new Promise((resolve) => setTimeout(resolve, 25));
          controller.enqueue(new TextEncoder().encode("real bytes"));
          controller.close();
        },
      }),
    );
  });
  const capture = await captureNetworkActivityFallback(
    "https://93.184.216.34/",
  );
  assert.equal(capture.mode, "http");
  assert.equal(capture.rawEvents.length, 4);
  const js = capture.rawEvents.find((r) => r.resourceType === "script")!;
  assert.equal(js.transferSize, 10);
  assert.ok(js.endTime - js.startTime >= 20);
  const bad = capture.rawEvents.find((r) => r.resourceType === "image")!;
  assert.equal(bad.status, null);
  assert.equal(bad.failed, true);
  assert.equal(bad.transferSize, 0);
  const normalized = normalizeCapturedEvents(
    capture.rawEvents,
    "93.184.216.34",
  );
  assert.equal(normalized.filter((r) => r.failed).length, 1);
});

test("unreachable main documents fail instead of returning a successful report", async () => {
  mock.method(globalThis, "fetch", async () => {
    throw new Error("fetch failed");
  });
  await assert.rejects(
    () => captureNetworkActivityFallback("https://93.184.216.34/"),
    /fetch failed/,
  );
});

test("oversized response bodies fail explicitly", async () => {
  mock.method(
    globalThis,
    "fetch",
    async () => new Response(new Uint8Array(2 * 1024 * 1024 + 1)),
  );
  await assert.rejects(
    () => captureNetworkActivityFallback("https://93.184.216.34/"),
    /size limit/,
  );
});

test("saved/exported reports strip headers; CSV escapes formulas and quotes", () => {
  const result = report();
  result.requests = [
    {
      id: "1",
      url: '=HYPERLINK("bad")',
      method: "GET",
      status: null,
      resourceType: "other",
      domain: "example.com",
      startTime: 0,
      endTime: 0,
      duration: 0,
      transferSize: 0,
      requestHeaders: { cookie: "secret" },
      responseHeaders: { "set-cookie": "secret" },
    },
  ];
  assert.equal(
    JSON.stringify(portableReport(result)).includes("secret"),
    false,
  );
  assert.ok(requestCsv(result).includes('"\'=HYPERLINK(""bad"")"'));
  assert.equal(result.requests[0].requestHeaders?.cookie, "secret");
});

test("comparison only selects previous captures of same URL, mode and destination", () => {
  const current = report();
  current.timestamp = "new";
  current.capture = { mode: "browser", finalUrl: current.url, warnings: [] };
  const old = { ...current, timestamp: "old" };
  assert.equal(
    previousComparable(current, [
      current,
      { ...old, url: "https://other.com/" },
      { ...old, capture: { ...current.capture, mode: "http" } },
      old,
    ]),
    old,
  );
});

test("cancel and replacement runs ignore stale responses and reset filters", async () => {
  const requests: Array<(value: Response) => void> = [];
  mock.method(
    globalThis,
    "fetch",
    () => new Promise<Response>((resolve) => requests.push(resolve)),
  );
  const store = useAnalysisStore;
  store.getState().setSearchQuery("stale");
  const first = store.getState().startAnalysis("https://first.com");
  const second = store.getState().startAnalysis("https://second.com");
  requests[0](Response.json({ success: true, result: report() }));
  await first;
  assert.equal(store.getState().status, "analyzing");
  assert.equal(store.getState().url, "https://second.com");
  store.getState().reset();
  requests[1](Response.json({ success: true, result: report() }));
  await second;
  assert.equal(store.getState().status, "idle");
  assert.equal(store.getState().result, null);
  assert.equal(store.getState().searchQuery, "");
});

test("successful reports remain usable when local storage is unavailable", async () => {
  mock.method(globalThis, "fetch", async () =>
    Response.json({ success: true, result: report() }),
  );
  await useAnalysisStore.getState().startAnalysis("https://93.184.216.34/");
  assert.equal(useAnalysisStore.getState().status, "complete");
  assert.ok(useAnalysisStore.getState().storageNotice);
});

test("non-JSON backend errors are actionable", async () => {
  mock.method(
    globalThis,
    "fetch",
    async () => new Response("<html>Gateway timeout</html>", { status: 504 }),
  );
  await useAnalysisStore.getState().startAnalysis("https://example.com");
  assert.equal(useAnalysisStore.getState().status, "error");
  assert.match(useAnalysisStore.getState().error!, /unreadable response/);
});

test("history is bounded, survives reload and can be cleared", async (t) => {
  const values = new Map<string, string>();
  const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => values.get(key) || null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    },
  });
  t.after(() => {
    if (original) Object.defineProperty(globalThis, "localStorage", original);
    else Reflect.deleteProperty(globalThis, "localStorage");
  });
  useAnalysisStore.setState({ history: [] });
  let index = 0;
  mock.method(globalThis, "fetch", async () =>
    Response.json({
      success: true,
      result: { ...report(), timestamp: String(index++) },
    }),
  );
  for (let i = 0; i < 7; i++)
    await useAnalysisStore.getState().startAnalysis("https://93.184.216.34/");
  assert.equal(useAnalysisStore.getState().history.length, 5);
  useAnalysisStore.setState({ history: [] });
  useAnalysisStore.getState().loadHistory();
  assert.equal(useAnalysisStore.getState().history.length, 5);
  assert.equal(useAnalysisStore.getState().history[0].timestamp, "6");
  useAnalysisStore.getState().clearHistory();
  assert.equal(values.size, 0);
  assert.equal(useAnalysisStore.getState().history.length, 0);
});

test("corrupt browser storage does not break the application", (t) => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: { getItem: () => "{broken" },
  });
  t.after(() => {
    if (original) Object.defineProperty(globalThis, "localStorage", original);
    else Reflect.deleteProperty(globalThis, "localStorage");
  });
  useAnalysisStore.getState().loadHistory();
  assert.deepEqual(useAnalysisStore.getState().history, []);
  assert.ok(useAnalysisStore.getState().storageNotice);
});
