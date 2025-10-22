/*
 * Crawler ל-AllForYou:
 * – מתחיל מ-BASE_URL (התחברות אם צריך)
 * – עובר על כל <a>, <button>, [role=button], [data-testid]
 * – בודק 404/500, שגיאות קונסול, Reject לא מטופל
 * – מייצר דוח JSON ו-CSV
 */
const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = process.env.AFY_BASE_URL || 'http://localhost:5173';
const MAX_PAGES = Number(process.env.AFY_MAX_PAGES || 300);
const AUTH_EMAIL = process.env.AFY_EMAIL || '';
const AUTH_PASS = process.env.AFY_PASSWORD || '';

function csvSafe(s) {
  return `"${String(s || '').replace(/"/g, '""')}"`;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  const report = {
    visited: [],
    errors: [],
    httpErrors: [],
    consoleErrors: [],
    unhandled: []
  };
  const seen = new Set();

  page.on('pageerror', (err) =>
    report.errors.push({ url: page.url(), message: String(err) })
  );
  page.on('console', (msg) => {
    const t = msg.type();
    if (t === 'error')
      report.consoleErrors.push({ url: page.url(), text: msg.text() });
  });
  page.on('requestfailed', (req) => {
    report.httpErrors.push({
      url: page.url(),
      request: req.url(),
      failure: req.failure()?.errorText
    });
  });
  page.on('response', async (res) => {
    try {
      const status = res.status();
      if (status >= 400)
        report.httpErrors.push({
          url: page.url(),
          request: res.url(),
          status
        });
    } catch {}
  });

  // התחברות אם צריך
  async function loginIfNeeded() {
    await page.goto(BASE_URL + '/dashboard', {
      waitUntil: 'domcontentloaded',
      timeout: 10000
    });
    if (page.url().includes('/auth/login') && AUTH_EMAIL && AUTH_PASS) {
      console.log('🔐 מתחבר עם:', AUTH_EMAIL);
      await page.fill('input[type="email"]', AUTH_EMAIL);
      await page.fill('input[type="password"]', AUTH_PASS);
      await page.click('button[type="submit"]');
      await page.waitForLoadState('domcontentloaded');
      console.log('✅ התחברות הושלמה');
    }
  }

  async function crawl(url) {
    if (seen.has(url) || report.visited.length >= MAX_PAGES) return;
    seen.add(url);

    try {
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });
      report.visited.push(url);
      console.log(`✓ ${report.visited.length}/${MAX_PAGES}: ${url}`);

      // אסוף כל הקישורים/כפתורים
      const links = await page.$$eval('a[href]', (els) =>
        els.map((e) => e.getAttribute('href'))
      );
      const buttons = await page.$$eval(
        'button,[role="button"],[data-testid]',
        (els) =>
          els.map((e) => ({
            text: e.textContent?.trim().slice(0, 80) || '',
            hasClick: !!e.getAttribute('onClick')
          }))
      );

      // הפוך href ל-URL מלא, סנן hash ומחוץ לדומיין
      const next = links
        .map((href) => {
          if (!href) return null;
          if (href.startsWith('#')) return null;
          try {
            const u = new URL(href, url);
            const baseHost = new URL(BASE_URL).host;
            if (u.host !== baseHost) return null;
            return u.href.split('?')[0];
          } catch {
            return null;
          }
        })
        .filter(Boolean);

      // לחץ על כפתורים לא מסוכנים
      const clickables = await page.$$(
        'a[href], [role="button"], button[data-testid]'
      );
      for (const el of clickables) {
        const tag = await el.evaluate((e) => e.tagName.toLowerCase());
        if (tag === 'a') continue; // ננווט דרך crawl
        const txt = (await el.textContent()) || '';
        const risky = /(שמור|מחיקה|מחק|אשר|עדכן|Submit|Save|Delete|Update)/i;
        if (risky.test(txt)) continue;
        try {
          await Promise.race([
            el.click({ timeout: 1000 }).then(() => page.waitForTimeout(200)),
            page.waitForTimeout(200)
          ]);
        } catch {}
      }

      // זחילה מעמיקה
      for (const n of next) {
        await crawl(n);
        if (report.visited.length >= MAX_PAGES) break;
      }
    } catch (err) {
      console.error(`❌ שגיאה בזחילה של ${url}:`, err.message);
    }
  }

  await loginIfNeeded();
  await crawl(BASE_URL);

  // כתיבת דוחות
  fs.mkdirSync('qa-report', { recursive: true });
  fs.writeFileSync(
    'qa-report/link-crawler.json',
    JSON.stringify(report, null, 2),
    'utf8'
  );

  // CSV מהיר לשגיאות HTTP
  const rows = [['PageURL', 'RequestURL', 'Status/Failure', 'Type']].concat(
    report.httpErrors.map((e) => [
      e.url,
      e.request,
      e.status ?? e.failure ?? '',
      'network'
    ])
  );
  const csv = rows.map((r) => r.map(csvSafe).join(',')).join('\n');
  fs.writeFileSync('qa-report/http-errors.csv', csv, 'utf8');

  // סיכום
  console.log('\n📊 סיכום:');
  console.log('✓ עמודים שבוקרו:', report.visited.length);
  console.log('❌ שגיאות HTTP:', report.httpErrors.length);
  console.log('❌ שגיאות קונסול:', report.consoleErrors.length);
  console.log('❌ שגיאות דף:', report.errors.length);

  if (report.httpErrors.length > 0) {
    console.log('\n🔴 שגיאות HTTP שנמצאו:');
    report.httpErrors.slice(0, 10).forEach((e) => {
      console.log(`  - ${e.status || e.failure}: ${e.request}`);
    });
  }

  await browser.close();
  const fail =
    report.httpErrors.length ||
    report.errors.length ||
    report.consoleErrors.length;
  process.exit(fail ? 1 : 0);
})();
