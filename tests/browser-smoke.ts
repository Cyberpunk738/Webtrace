import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { runPerformanceAnalysis } from "../engine/analyzer";

async function main() {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH,
    headless: true,
    args: ["--no-sandbox"],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1050 },
    acceptDownloads: true,
  });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  let run = 0;
  const url = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";
  const result = runPerformanceAnalysis(
    "https://example.com/",
    [
      {
        id: "req_doc",
        url: "https://example.com/",
        method: "GET",
        resourceType: "document",
        status: 200,
        domain: "example.com",
        startTime: 0,
        endTime: 140,
        duration: 140,
        transferSize: 2400,
      },
      {
        id: "req_js",
        url: "https://example.com/main.js",
        method: "GET",
        resourceType: "script",
        status: 200,
        domain: "example.com",
        startTime: 150,
        endTime: 1650,
        duration: 1500,
        transferSize: 1200000,
      },
      {
        id: "req_img",
        url: "https://example.com/hero.png",
        method: "GET",
        resourceType: "image",
        status: 404,
        domain: "example.com",
        startTime: 155,
        endTime: 320,
        duration: 165,
        transferSize: 0,
        failed: true,
      },
    ],
    {
      navigationStart: 0,
      firstRequest: 0,
      lastResponse: 1650,
      totalLoadTime: 1850,
    },
  );
  result.capture = {
    mode: "http",
    finalUrl: result.url,
    warnings: ["Limited HTTP inspection: JavaScript was not executed."],
  };
  await page.route("**/api/analyze", async (route) => {
    run++;
    await route.fulfill({
      json: {
        success: true,
        result: {
          ...result,
          timestamp: new Date(Date.now() + run * 1000).toISOString(),
        },
      },
    });
  });
  await mkdir("test-results", { recursive: true });
  await page.goto(url);
  await page.locator("h1").waitFor();
  await page.screenshot({
    path: "test-results/landing-desktop.png",
    fullPage: true,
  });
  await page.getByRole("tab", { name: "02 Investigate" }).click();
  await page.getByRole("tabpanel").getByText("Find your next fix.").waitFor();
  await page.locator("#target-url").fill("http://127.0.0.1");
  await page
    .getByRole("button", { name: "Trace website", exact: true })
    .click();
  await page.locator("#url-error").waitFor();
  await page.locator("#target-url").fill("example.com");
  await page
    .getByRole("button", { name: "Trace website", exact: true })
    .click();
  await page.getByText("LIMITED HTTP INSPECTION", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Failed", exact: true }).click();
  await page.getByText("Showing 1 of 3 requests").waitFor();
  await page
    .getByRole("button", {
      name: "Inspect https://example.com/hero.png",
      exact: true,
    })
    .click();
  await page.getByRole("dialog").waitFor();
  await page.keyboard.press("Escape");
  assert.equal(await page.getByRole("dialog").count(), 0);
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Requests CSV" }).click();
  assert.ok((await download).suggestedFilename().endsWith(".csv"));
  await page.getByRole("button", { name: "Run again" }).click();
  await page.getByText("VERSUS PREVIOUS TRACE").waitFor();
  await page.getByText("Showing 3 of 3 requests").waitFor();
  await page.screenshot({
    path: "test-results/report-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "New analysis" }).click();
  await page.reload();
  await page.getByText("Recent traces", { exact: false }).waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "test-results/landing-mobile.png",
    fullPage: true,
  });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    ),
    false,
    "Landing has horizontal overflow",
  );
  await page.locator(".history-list button").first().click();
  await page.getByText("LIMITED HTTP INSPECTION", { exact: true }).waitFor();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "test-results/report-mobile.png",
    fullPage: true,
  });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    ),
    false,
    "Report has horizontal overflow",
  );
  await page.getByRole("button", { name: "Clear saved reports" }).click();
  await page.getByRole("button", { name: "New analysis" }).click();
  assert.equal(await page.locator(".history-list button").count(), 0);
  assert.deepEqual(errors, []);
  // Real endpoint validation, separately from UI fixture requests.
  const blocked = await context.request.post(`${url}/api/analyze`, {
    data: { url: "http://127.0.0.1" },
  });
  assert.equal(blocked.status(), 400);
  const malformed = await context.request.post(`${url}/api/analyze`, {
    data: null,
  });
  assert.equal(malformed.status(), 400);
  console.log(
    "Browser smoke passed: desktop/mobile, validation, tabs, failures, inspector, export, rerun, comparison, persistence, clear history, API validation.",
  );
  await browser.close();
}
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
