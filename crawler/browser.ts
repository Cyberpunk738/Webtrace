import { chromium, Browser, BrowserContext } from 'playwright';

export async function launchBrowser(): Promise<Browser> {
  return await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--ignore-certificate-errors',
    ],
  });
}

export async function createBrowserContext(browser: Browser): Promise<BrowserContext> {
  return await browser.newContext({
    viewport: { width: 1366, height: 768 },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 WebTrace/1.0',
    ignoreHTTPSErrors: true,
  });
}
