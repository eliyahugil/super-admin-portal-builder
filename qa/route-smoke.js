/*
 * בדיקת עשן לנתיבים ידועים
 * טוען כל route ומוודא שאין 404/שגיאות DOM
 */
const { chromium } = require('playwright');

const BASE_URL = process.env.AFY_BASE_URL || 'http://localhost:5173';
const ROUTES = [
  '/',
  '/auth/login',
  '/dashboard',
  '/production',
  '/production/batches',
  '/production/raw-materials',
  '/production/quality-checks',
  '/modules/employees',
  '/modules/employees/requests',
  '/modules/settings/profile'
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext()).newPage();
  let failures = 0;

  console.log('🧪 בודק נתיבים...\n');

  for (const r of ROUTES) {
    try {
      const url = BASE_URL + r;
      const resp = await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });
      const st = resp?.status() || 0;

      if (st >= 400) {
        console.error(`❌ HTTP ${st}: ${url}`);
        failures++;
        continue;
      }

      // חפש הודעת שגיאה גלויה ב-DOM
      const bodyText = await page.textContent('body');
      if (/(שגיאה|Error|Not Found|404)/i.test(bodyText || '')) {
        console.error(`❌ שגיאה ב-DOM: ${url}`);
        failures++;
        continue;
      }

      console.log(`✓ ${url}`);
    } catch (e) {
      console.error(`❌ כישלון ניווט: ${r} - ${e.message}`);
      failures++;
    }
  }

  await browser.close();

  console.log(`\n📊 סיכום: ${ROUTES.length - failures}/${ROUTES.length} נתיבים תקינים`);
  process.exit(failures ? 1 : 0);
})();
