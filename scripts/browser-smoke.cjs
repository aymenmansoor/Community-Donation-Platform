/* Real browser checks: requires running API, React and seeded MongoDB. No response mocking. */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const mongoose = require('../backend/node_modules/mongoose');
const User = require('../backend/models/User');
const Donation = require('../backend/models/Donation');
const Request = require('../backend/models/Request');
const root = path.resolve(__dirname, '..');
const screenshots = path.join(root, 'docs/screenshots');
const password = process.env.DEMO_PASSWORD;
const base = process.env.FRONTEND_URL || 'http://127.0.0.1:3000';
const pages = [], checks = [], errors = [];
let browser;
async function check(name, action) { await action(); checks.push(name); console.log('PASS:', name); }
async function capture(page, name) {
  await page.evaluate(() => document.fonts.ready);
  await page.locator('img').evaluateAll(images => Promise.all(images.map(img => img.complete ? null : new Promise(resolve => { img.onload = resolve; img.onerror = resolve; }))));
  // Bootstrap must be genuinely loaded; do not capture an unstyled or failed page.
  assert.equal(await page.locator('nav').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(25, 135, 84)');
  const file = path.join(screenshots, name + '.png');
  await page.screenshot({ path: file, fullPage: true, animations: 'disabled' });
  pages.push({ file: `docs/screenshots/${name}.png`, sha256: crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex') });
}
async function login(page, email) {
  await page.goto(base + '/auth');
  const switcher = page.getByRole('button', { name: 'Login Here' });
  if (await switcher.count()) await switcher.click();
  await page.getByLabel('Email Address', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await page.getByRole('heading', { name: /Welcome,/ }).waitFor();
}
async function main() {
  assert(password, 'DEMO_PASSWORD required; use private local demo.env');
  fs.mkdirSync(screenshots, { recursive: true });
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/community_donation');
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true });
  const donorContext = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'en-GB', timezoneId: 'Asia/Karachi' });
  const page = await donorContext.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('dialog', dialog => dialog.accept());
  await check('Registration screen and real account creation', async () => {
    await page.goto(base + '/auth');
    await page.getByRole('heading', { name: 'Create an Account' }).waitFor();
    await capture(page, 'registration');
    // This temporary fixture is removed in finally, leaving the three stable seed accounts.
    await User.deleteOne({ email: 'browser.smoke@example.test' });
    await page.getByLabel('Full Name').fill('Alex Meadow');
    await page.getByLabel('Email Address', { exact: true }).fill('browser.smoke@example.test');
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByLabel('Register As:').selectOption('Requester');
    const response = page.waitForResponse(r => r.url().endsWith('/api/auth/signup') && r.request().method() === 'POST');
    await page.getByRole('button', { name: 'Sign Up Now', exact: true }).click();
    assert.equal((await response).status(), 201);
    await page.getByRole('heading', { name: 'Login', exact: true }).waitFor();
    await capture(page, 'login');
  });
  await check('Donor login and home', async () => {
    await login(page, 'mira.donor@example.test');
    await capture(page, 'home');
  });
  await check('Donation form saves a real listing', async () => {
    await page.getByRole('link', { name: /Donate Now/ }).click();
    await page.getByLabel('Item Name').fill('Canvas school backpack');
    await page.getByLabel('Category', { exact: true }).selectOption('Other');
    await page.getByLabel('Description').fill('A clean, sturdy backpack with two compartments and adjustable straps. Fictional browser test listing.');
    await capture(page, 'donation-form');
    const response = page.waitForResponse(r => r.url().endsWith('/api/donate') && r.request().method() === 'POST');
    await page.getByRole('button', { name: 'Post Donation' }).click();
    assert.equal((await response).status(), 201);
    await page.getByLabel('Item Name').filter({ hasText: '' }).waitFor();
  });
  await check('Donor profile lists saved donations; delete control works', async () => {
    await page.getByRole('link', { name: 'Profile', exact: true }).click();
    await page.getByRole('heading', { name: 'Canvas school backpack' }).waitFor();
    const card = page.locator('.card').filter({ has: page.getByRole('heading', { name: 'Canvas school backpack' }) });
    const deleted = page.waitForResponse(r => /\/api\/donations\//.test(r.url()) && r.request().method() === 'DELETE');
    await card.getByRole('button', { name: 'Delete', exact: true }).click();
    assert.equal((await deleted).status(), 204);
    await page.getByRole('heading', { name: 'Canvas school backpack' }).waitFor({ state: 'detached' });
    assert.equal(await page.locator('.card-title').count(), 6);
    await capture(page, 'donor-profile');
  });
  const requesterContext = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'en-GB', timezoneId: 'Asia/Karachi' });
  const requesterPage = await requesterContext.newPage();
  requesterPage.on('pageerror', error => errors.push(error.message));
  requesterPage.on('dialog', dialog => dialog.accept());
  await check('Requester login, available items, and request modal', async () => {
    await login(requesterPage, 'rowan.requester@example.test');
    await requesterPage.getByRole('link', { name: /My Requests/ }).click();
    await requesterPage.getByRole('cell', { name: 'Approved', exact: true }).waitFor();
    for (const status of ['Pending','Approved','Rejected']) assert(await requesterPage.getByRole('cell', { name: status, exact: true }).isVisible());
    await capture(requesterPage, 'my-requests');
    await requesterPage.getByRole('link', { name: /Browse Items/ }).click();
    await requesterPage.getByRole('heading', { name: 'Adjustable study lamp' }).waitFor();
    assert.equal(await requesterPage.locator('.card-title').count(), 6);
    assert.equal(await requesterPage.locator('img').evaluateAll(images => images.filter(i => !i.complete || !i.naturalWidth).length), 0);
    await capture(requesterPage, 'available-items');
    const card = requesterPage.locator('.card').filter({ has: requesterPage.getByRole('heading', { name: 'Adjustable study lamp' }) });
    await card.getByRole('button', { name: /Request Now/ }).click();
    await requesterPage.getByRole('dialog').waitFor();
    await requesterPage.getByPlaceholder('Tell the donor why you need this item...').fill('I am creating a quiet study corner for a fictional evening class and this lamp would be very useful.');
    await capture(requesterPage, 'request-submission');
    const response = requesterPage.waitForResponse(r => r.url().endsWith('/api/requests') && r.request().method() === 'POST');
    await requesterPage.getByRole('button', { name: 'Submit Request' }).click();
    assert.equal((await response).status(), 201);
    await requesterPage.waitForLoadState('domcontentloaded');
    await requesterPage.getByRole('link', { name: /My Requests/ }).click();
    await requesterPage.getByRole('cell', { name: 'Adjustable study lamp', exact: true }).waitFor();
  });
  await check('Donor request management persists approval and rejection', async () => {
    await page.getByRole('link', { name: /Received Requests/ }).click();
    await page.getByRole('heading', { name: 'Science textbook collection' }).waitFor();
    // Remove the transient request after exercising its submission, so the gallery shows stable fixtures.
    const lamp = await Donation.findOne({ itemName: 'Adjustable study lamp', donorEmail: 'mira.donor@example.test' });
    await Request.deleteMany({ itemId: lamp._id });
    await page.reload();
    await page.getByRole('heading', { name: 'Science textbook collection' }).waitFor();
    await capture(page, 'donor-requests');
    const card = page.locator('.card').filter({ has: page.getByRole('heading', { name: 'Science textbook collection' }) });
    for (const status of ['Approved','Rejected']) {
      const response = page.waitForResponse(r => /\/api\/requests\//.test(r.url()) && r.request().method() === 'PUT');
      await card.getByRole('button', { name: status === 'Approved' ? 'Approve' : 'Reject', exact: true }).click();
      assert.equal((await response).status(), 200);
      await card.locator('.badge').filter({ hasText: status }).waitFor();
      await requesterPage.reload();
      const row = requesterPage.getByRole('row').filter({ has: requesterPage.getByRole('cell', { name: 'Science textbook collection', exact: true }) });
      assert.equal(await row.locator('.badge').last().innerText(), status);
    }
  });
  assert.deepEqual(errors, [], 'No browser runtime exceptions');
  fs.writeFileSync(path.join(screenshots, 'capture-manifest.json'), JSON.stringify({ capturedAt: new Date().toISOString(), browser: await browser.version(), viewport: '1440×1000', source: 'Actual running React UI and Express API with local MongoDB; no mocked responses or screenshot composites.', checks, pages }, null, 2) + '\n');
  console.log(`Browser checks passed: ${checks.length}; genuine screenshots saved: ${pages.length}`);
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
  if (browser) await browser.close();
  if (mongoose.connection.readyState === 1) {
    await User.deleteOne({ email: 'browser.smoke@example.test' });
    const donor = 'mira.donor@example.test';
    const book = await Donation.findOne({ itemName: 'Science textbook collection', donorEmail: donor });
    const lamp = await Donation.findOne({ itemName: 'Adjustable study lamp', donorEmail: donor });
    if (book) await Request.updateMany({ itemId: book._id }, { status: 'Pending' });
    if (lamp) await Request.deleteMany({ itemId: lamp._id });
    await Donation.deleteMany({ itemName: 'Canvas school backpack', donorEmail: donor });
    await mongoose.disconnect();
  }
});
