import { chromium } from 'playwright';

const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });

async function shot(page, name) {
  const path = `/tmp/shot-${name}.png`;
  await page.screenshot({ path, fullPage: false });
  console.log(`  📸 ${name}`);
}

async function waitForRedirectAway(page, pattern, timeout = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (!page.url().includes(pattern)) return true;
    await page.waitForTimeout(300);
  }
  return false;
}

// Fresh context per test to avoid cookie bleed
async function freshPage() {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  return ctx.newPage();
}

// ── 1. Login page ────────────────────────────────────────────────────────────
console.log('\n[1] Login page loads');
{
  const page = await freshPage();
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  console.log('  Title:', await page.title());
  console.log('  URL  :', page.url());
  await shot(page, '1-login-page');
  await page.context().close();
}

// ── 2. Super Admin login ─────────────────────────────────────────────────────
console.log('\n[2] Super Admin login');
{
  const page = await freshPage();
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.locator('button', { hasText: 'Super Admin' }).first().click();
  await page.waitForTimeout(300);
  await page.fill('input[type="email"]', 'superadmin@smvs.org');
  await page.fill('input[type="password"]', 'Smvs@Demo2026');
  await page.click('button[type="submit"]');
  const ok = await waitForRedirectAway(page, '/login');
  console.log('  Redirected:', ok ? '✅ to ' + page.url() : '❌ still on login');
  if (ok) {
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    console.log('  Body has "Dashboard":', body.includes('Dashboard') ? '✅' : '❌');
    console.log('  Body has "Center":', body.includes('Center') ? '✅' : '❌');
    await shot(page, '2-super-admin-dashboard');
  }
  await page.context().close();
}

// ── 3. Center Admin login ─────────────────────────────────────────────────────
console.log('\n[3] Center Admin login (admin.ahm@smvs.org)');
{
  const page = await freshPage();
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.locator('button', { hasText: 'Center Admin' }).first().click();
  await page.waitForTimeout(500);
  const sel = page.locator('select').first();
  if (await sel.isVisible()) {
    const opts = await sel.locator('option').allTextContents();
    const ahm  = opts.find(o => o.includes('Ahmedabad'));
    if (ahm) await sel.selectOption({ label: ahm });
    else      await sel.selectOption({ index: 1 });
  }
  await page.fill('input[type="email"]', 'admin.ahm@smvs.org');
  await page.fill('input[type="password"]', 'Smvs@Demo2026');
  await page.click('button[type="submit"]');
  const ok = await waitForRedirectAway(page, '/login');
  console.log('  Redirected:', ok ? '✅ to ' + page.url() : '❌ still on login');
  if (ok) {
    await page.waitForLoadState('networkidle');
    const body = await page.textContent('body');
    console.log('  Body has "Dashboard":', body.includes('Dashboard') ? '✅' : '❌');
    await shot(page, '3-center-admin-dashboard');
  }
  await page.context().close();
}

// ── 4. Member login ───────────────────────────────────────────────────────────
console.log('\n[4] Member login (AHM001)');
{
  const page = await freshPage();
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.locator('button', { hasText: 'Member' }).first().click();
  await page.waitForTimeout(300);
  // Find the global ID input
  const inp = page.locator('input').first();
  const ph  = await inp.getAttribute('placeholder');
  console.log('  Input placeholder:', ph);
  await inp.fill('AHM001');
  await page.click('button[type="submit"]');
  const ok = await waitForRedirectAway(page, '/login');
  console.log('  Redirected:', ok ? '✅ to ' + page.url() : '❌ still on login');
  if (ok) {
    await page.waitForLoadState('networkidle');
    await shot(page, '4-member-dashboard');
  }
  await page.context().close();
}

// ── 5. Wrong password ─────────────────────────────────────────────────────────
console.log('\n[5] Wrong password rejection');
{
  const page = await freshPage();
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.locator('button', { hasText: 'Super Admin' }).first().click();
  await page.waitForTimeout(200);
  await page.fill('input[type="email"]', 'superadmin@smvs.org');
  await page.fill('input[type="password"]', 'WrongPassword!');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);
  const body = await page.textContent('body');
  const staysOnLogin = page.url().includes('/login');
  const hasErr = body.toLowerCase().includes('invalid') || body.toLowerCase().includes('incorrect');
  console.log('  Stays on /login:', staysOnLogin ? '✅' : '❌');
  console.log('  Error visible:  ', hasErr ? '✅' : '❌');
  await shot(page, '5-wrong-password');
  await page.context().close();
}

// ── 6. Session protection ──────────────────────────────────────────────────────
console.log('\n[6] Route protection (unauthenticated → redirects to /login)');
{
  const page = await freshPage();
  await page.goto('http://localhost:3000/super-admin', { waitUntil: 'networkidle' });
  const url = page.url();
  console.log('  /super-admin redirects to:', url.includes('/login') ? '✅ /login' : '❌ ' + url);
  await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle' });
  const url2 = page.url();
  console.log('  /admin redirects to:      ', url2.includes('/login') ? '✅ /login' : '❌ ' + url2);
  await page.context().close();
}

await browser.close();
console.log('\n✅ All tests complete');
