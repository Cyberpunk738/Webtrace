import type { Browser, BrowserContext } from 'playwright-core';

export async function launchBrowser(): Promise<Browser> {
  const isServerless =
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NODE_ENV === 'production';

  if (isServerless) {
    try {
      const chromium = (await import('@sparticuz/chromium')).default;
      const { chromium: playwrightChromium } = await import('playwright-core');

      const executablePath = await chromium.executablePath();

      return await playwrightChromium.launch({
        args: chromium.args,
        executablePath,
        headless: true,
      });
    } catch (serverlessErr) {
      console.warn('Serverless chromium launch failed, attempting standard playwright launch...', serverlessErr);
    }
  }

  // Local / standard Node environment
  const { chromium } = await import('playwright');
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
