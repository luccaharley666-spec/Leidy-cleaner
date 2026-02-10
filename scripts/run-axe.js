const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const axe = require('axe-core');

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const url = process.env.BASE_URL || 'http://localhost:3000';
  console.log('Connecting to', url);
  await page.goto(url, { waitUntil: 'networkidle' });

  // Inject axe-core source into the page
  await page.addScriptTag({ content: axe.source });

  const results = await page.evaluate(async () => {
    // [REDACTED_TOKEN] no-undef
    return await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2aa'] } });
  });

  await browser.close();

  const outDir = path.join(process.cwd(), 'test-results');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'axe-report.json');
  fs.writeFileSync(outFile, JSON.stringify(results, null, 2));
  console.log('Axe results written to', outFile);

  const violations = results.violations || [];
  console.log(`Violations: ${violations.length}`);
  violations.slice(0, 10).forEach((v, i) => {
    console.log(`${i + 1}. ${v.id} (${v.impact}) - ${v.help}`);
  });

  if (violations.length > 0) process.exitCode = 2;
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
