const { test, expect } = require('@playwright/test');

test('page loads clean with key content', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => m.type() === 'error' && errors.push(m.text()));
  await page.goto('/');
  await expect(page).toHaveTitle(/Shashank Chinchli/);
  await expect(page.locator('h1')).toContainText('Shashank Chinchli');
  await expect(page.locator('.role-line')).toContainText('GitLab');
  const intro = page.locator('.hero-intro');
  for (const t of ['AWS Community Builder', 'AWS User Group Leader', 'Golden Jacket', '14+ years']) {
    await expect(intro).toContainText(t);
  }
  expect(errors).toEqual([]);
});

test('no horizontal overflow', async ({ page }) => {
  await page.goto('/');
  const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect(over).toBeLessThanOrEqual(0);
});

test('Jeff Barr photo links to Instagram post', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('a[href="https://www.instagram.com/p/DcFel3WNhsY/"]').first()).toBeAttached();
});

test('SEO metadata and JSON-LD', async ({ page }) => {
  await page.goto('/');
  const desc = await page.locator('meta[name=description]').getAttribute('content');
  expect(desc.length).toBeLessThanOrEqual(160);
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', /schinchli\.github\.io/);
  await expect(page.locator('meta[property="og:image"]')).toBeAttached();
  const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').first().textContent());
  expect(JSON.stringify(ld)).toContain('Person');
});

test('mentoring proof and content tabs work', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.intro.proof')).toContainText('1,000+');
  const tab = page.getByRole('tab', { name: /videos/i });
  await tab.scrollIntoViewIfNeeded();
  await tab.click();
  await expect(tab).toHaveAttribute('aria-selected', 'true');
});

test('static files and internal links resolve', async ({ page, request }) => {
  for (const p of ['/resume.pdf', '/sitemap.xml', '/robots.txt', '/llms.txt', '/favicon.svg', '/img/og.jpg']) {
    expect((await request.get(p)).status(), p).toBe(200);
  }
  await page.goto('/');
  const ids = await page.$$eval('a[href^="#"]', a => a.map(x => x.getAttribute('href')).filter(h => h.length > 1));
  for (const h of new Set(ids)) expect(await page.locator(h).count(), h).toBeGreaterThan(0);
});
