// Real Chromium lifecycle test against a controlled local HTTP fixture.
// Only the fixture's address guard and browser launcher are replaced here.
import { createServer } from "node:http";
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { captureNetworkActivity } from "../crawler/capture";
import { createBrowserContext } from "../crawler/browser";

async function main() {
  const server = createServer((request, response) => {
    if (request.url === "/redirect") {
      response.writeHead(302, { location: "/page" });
      response.end();
      return;
    }
    if (request.url === "/page") {
      response.writeHead(200, { "content-type": "text/html" });
      response.end(
        '<html><script src="/slow.js"></script><img src="/missing.png"><img src="/pending.png"></html>',
      );
      return;
    }
    if (request.url === "/slow.js") {
      response.writeHead(200, { "content-type": "application/javascript" });
      response.write("// first bytes\n");
      setTimeout(() => response.end('console.log("complete");'), 200);
      return;
    }
    if (request.url === "/pending.png") {
      response.writeHead(200, { "content-type": "image/png" });
      response.write("incomplete");
      return;
    }
    response.writeHead(404);
    response.end("missing");
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH,
    headless: true,
    args: ["--no-sandbox"],
  });
  try {
    const result = await captureNetworkActivity(
      `http://127.0.0.1:${address.port}/redirect`,
      {},
      {
        launchBrowser: async () => browser,
        createBrowserContext,
        assertPublicUrl: async (input: string) => {
          assert.equal(new URL(input).hostname, "127.0.0.1");
        },
      },
    );
    assert.ok(result.finalUrl.endsWith("/page"));
    assert.equal(result.mode, "browser");
    const script = result.rawEvents.find((event) =>
      event.url.endsWith("slow.js"),
    )!;
    assert.ok(
      script.endTime - script.startTime >= 180,
      "Duration includes body completion, not just headers",
    );
    assert.ok(
      script.transferSize > 0,
      "Completed response has measured encoded body size",
    );
    const missing = result.rawEvents.find((event) =>
      event.url.endsWith("missing.png"),
    )!;
    assert.equal(missing.status, 404);
    assert.equal(missing.failed, true);
    assert.equal(
      result.rawEvents.some((event) => event.status === 302),
      true,
    );
    const pending = result.rawEvents.find((event) =>
      event.url.endsWith("pending.png"),
    )!;
    assert.equal(pending.failed, true);
    assert.match(pending.failureReason!, /Still pending/);
    assert.ok(
      result.warnings?.some((message) => message.includes("unfinished")),
    );
    assert.equal(browser.isConnected(), false, "Capture closes the browser");
    console.log(
      "Browser capture passed: redirects, actual body completion, encoded bytes, HTTP failures and cleanup.",
    );
  } finally {
    await browser.close();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
