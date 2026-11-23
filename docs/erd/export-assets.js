import { chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function exportAssets() {
  console.log('[1/4] Launching headless browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 2800, height: 2000 },
    deviceScaleFactor: 2 // High-DPI for ultra sharp image
  });
  const page = await context.newPage();

  const htmlPath = path.join(__dirname, 'render-erd.html');
  const fileUrl = `file:///${htmlPath.replace(/\\/g, '/')}`;
  console.log(`[2/4] Navigating to: ${fileUrl}`);

  await page.goto(fileUrl, { waitUntil: 'networkidle' });

  // Wait for Mermaid SVG to render
  await page.waitForSelector('#mermaid-container svg', { timeout: 30000 });
  await page.waitForTimeout(2000); // Allow fonts & layout to stabilize

  const pngPath = path.join(__dirname, 'ERD_SIBLUD_RSJTampan_v1.0.png');
  const pdfPath = path.join(__dirname, 'ERD_SIBLUD_RSJTampan_v1.0.pdf');

  console.log('[3/4] Exporting PNG (High Resolution)...');
  await page.screenshot({
    path: pngPath,
    fullPage: true
  });
  console.log(` -> PNG Saved: ${pngPath}`);

  console.log('[4/4] Exporting PDF (Vector Landscape)...');
  await page.pdf({
    path: pdfPath,
    format: 'A2',
    landscape: true,
    printBackground: true,
    margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
  });
  console.log(` -> PDF Saved: ${pdfPath}`);

  await browser.close();
  console.log('\n[SUCCESS] ERD PNG and PDF generated successfully!');
}

exportAssets().catch((err) => {
  console.error('[ERROR] Failed to export ERD assets:', err);
  process.exit(1);
});
