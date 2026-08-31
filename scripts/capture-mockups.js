const { chromium } = require('playwright');
const path = require('path');
const http = require('http');
const fs = require('fs');

const mockupsDir = path.resolve(process.cwd(), 'report/mockups');
const screenshotsDir = path.resolve(process.cwd(), 'report/mockups/screenshots');

// Ensure screenshots directory exists
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Create a simple static server
const server = http.createServer((req, res) => {
  const url = req.url === '/' ? '/index.html' : req.url;
  const filePath = path.join(mockupsDir, url.split('?')[0]);
  const ext = path.extname(filePath).toLowerCase();
  const contentTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
  };
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(8766, '127.0.0.1', async () => {
  console.log('Server listening on http://127.0.0.1:8766');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const files = [
    { url: 'http://127.0.0.1:8766/login.html', name: '01-login-mockup.png' },
    { url: 'http://127.0.0.1:8766/signup.html', name: '02-signup-mockup.png' },
    { url: 'http://127.0.0.1:8766/tasks.html', name: '03-tasks-mockup.png' },
    { url: 'http://127.0.0.1:8766/landing.html', name: '04-landing-mockup.png' },
  ];

  for (const item of files) {
    await page.goto(item.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const screenshotPath = path.join(screenshotsDir, item.name);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('Screenshot saved:', screenshotPath);
  }

  await browser.close();
  server.close(() => {
    console.log('Done');
    process.exit(0);
  });
});
