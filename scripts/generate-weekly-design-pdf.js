const { chromium } = require('playwright');
const path = require('path');
const http = require('http');
const fs = require('fs');

const rootDir = path.resolve(process.cwd(), 'report');
const outputPdf = path.resolve(rootDir, 'weekly-design-review.pdf');

const server = http.createServer((req, res) => {
  const url = req.url === '/' ? '/index.html' : req.url;
  const filePath = path.join(rootDir, url.split('?')[0]);
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

server.listen(8767, '127.0.0.1', async () => {
  console.log('Server listening on http://127.0.0.1:8767');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  await page.goto('http://127.0.0.1:8767/weekly-design-review.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  await page.pdf({
    path: outputPdf,
    format: 'A4',
    printBackground: true,
    margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
  });

  console.log('PDF saved:', outputPdf);

  await browser.close();
  server.close(() => {
    console.log('Done');
    process.exit(0);
  });
});
