const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const outDir = path.resolve(process.cwd(), 'report/phase0-screenshots');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const baseUrl = 'http://localhost:3000';
const routes = [
  { path: '/auth/signup', name: '01-signup-page.png' },
  { path: '/auth/sign-up', name: '02-sign-up-canonical.png' },
  { path: '/dashboard/tasks', name: '03-tasks-redirect.png' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  for (const route of routes) {
    await page.goto(`${baseUrl}${route.path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const screenshotPath = path.join(outDir, route.name);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('Screenshot saved:', screenshotPath, 'URL:', page.url());
  }

  await browser.close();
})();
