const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const database = `community_test_${crypto.randomUUID().replaceAll('-', '')}`;
process.env.JWT_SECRET = crypto.randomBytes(48).toString('hex');
process.env.UPLOAD_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'community-uploads-'));
const { app } = require('../server');
let server, base;
const password = 'Fictional-test-password-2026';
async function call(route, { token, body, method = 'GET', headers = {} } = {}) {
  const response = await fetch(base + route, { method, headers: { ...(body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers }, body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined });
  return { status: response.status, data: response.status === 204 ? null : await response.json(), headers: response.headers };
}
let donor, requester, stranger, donation, request;
before(async () => {
  await mongoose.connect(`mongodb://127.0.0.1:27017/${database}`);
  await require('../models/User').init();
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
  if (mongoose.connection.readyState === 1) await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  fs.rmSync(process.env.UPLOAD_DIR, { recursive: true, force: true });
});
test('connected database health and origin allowlist', async () => {
  assert.equal((await call('/api/health')).data.database, 'connected');
  const denied = await call('/api/health', { headers: { Origin: 'https://untrusted.example' } });
  assert.equal(denied.headers.get('access-control-allow-origin'), null);
  const allowed = await call('/api/health', { headers: { Origin: 'http://localhost:3000' } });
  assert.equal(allowed.headers.get('access-control-allow-origin'), 'http://localhost:3000');
});
test('signup/login validate inputs and preserve account roles', async () => {
  assert.equal((await call('/api/auth/signup', { method: 'POST', body: { fullName: 'Invalid', email: { $ne: '' }, password } })).status, 400);
  for (const [name, role] of [['donor', 'Donor'], ['requester', 'Requester'], ['stranger', 'Donor']]) {
    const body = { fullName: `Fictional ${name}`, email: `${name}@example.test`, password, role };
    assert.equal((await call('/api/auth/signup', { method: 'POST', body })).status, 201);
    const login = await call('/api/auth/login', { method: 'POST', body });
    assert.equal(login.status, 200);
    assert.equal(login.data.user.role, role);
    if (name === 'donor') donor = login.data;
    if (name === 'requester') requester = login.data;
    if (name === 'stranger') stranger = login.data;
  }
  assert.equal((await call('/api/auth/login', { method: 'POST', body: { email: 'donor@example.test', password: 'wrong' } })).status, 401);
});
test('donations require donor authentication and derive ownership from the session', async () => {
  const body = { itemName: 'Study books', category: 'Books', description: 'Fictional integration test item', contact: 'Not shared', donorEmail: 'spoof@example.test' };
  assert.equal((await call('/api/donate', { method: 'POST', body })).status, 401);
  assert.equal((await call('/api/donate', { method: 'POST', body, token: requester.token })).status, 403);
  const result = await call('/api/donate', { method: 'POST', body, token: donor.token });
  assert.equal(result.status, 201);
  donation = result.data;
  assert.equal(donation.donorEmail, donor.user.email);
  assert.equal((await call('/api/donations', { token: requester.token })).data.length, 1);
  assert.equal((await call('/api/donations', { token: 'invalid' })).status, 401);
});
test('uploads validate signatures and enforce file size limits', async () => {
  function form(blob) { const data = new FormData(); data.append('itemName', 'Image test'); data.append('category', 'Other'); data.append('description', 'Test upload'); data.append('image', blob, 'image.png'); return data; }
  const invalid = await call('/api/donate', { method: 'POST', token: donor.token, body: form(new Blob(['<script>alert(1)</script>'], { type: 'image/png' })) });
  assert.equal(invalid.status, 400);
  const large = await call('/api/donate', { method: 'POST', token: donor.token, body: form(new Blob([Buffer.alloc(5 * 1024 * 1024 + 1)])) });
  assert.equal(large.status, 400);
  const png = await require('sharp')({ create: { width: 2, height: 2, channels: 3, background: 'green' } }).png().toBuffer();
  const result = await call('/api/donate', { method: 'POST', token: donor.token, body: form(new Blob([png], { type: 'image/png' })) });
  assert.equal(result.status, 201);
  const image = await fetch(base + '/uploads/' + result.data.image);
  assert.equal(image.status, 200);
  assert.equal(image.headers.get('x-content-type-options'), 'nosniff');
  assert.equal((await call('/api/donations/' + result.data._id, { method: 'DELETE', token: donor.token })).status, 204);
});
test('request creation prevents impersonation, status injection and duplicates', async () => {
  const result = await call('/api/requests', { method: 'POST', token: requester.token, body: { itemId: donation._id, reason: 'For a fictional study group', requesterId: donor.user.id, status: 'Approved' } });
  assert.equal(result.status, 201);
  request = result.data;
  assert.equal(request.status, 'Pending');
  assert.equal(request.requesterId, requester.user.id);
  assert.equal((await call('/api/requests', { method: 'POST', token: requester.token, body: { itemId: donation._id, reason: 'Duplicate' } })).status, 409);
  assert.equal((await call('/api/requests', { token: stranger.token })).data.length, 0);
  assert.equal((await call('/api/requests/user/' + requester.user.id, { token: stranger.token })).status, 403);
});
test('only the owning donor can approve/reject and delete an item', async () => {
  const route = '/api/requests/' + request._id;
  assert.equal((await call(route, { method: 'PUT', token: stranger.token, body: { status: 'Approved' } })).status, 403);
  assert.equal((await call(route, { method: 'PUT', token: requester.token, body: { status: 'Approved' } })).status, 403);
  assert.equal((await call(route, { method: 'PUT', token: donor.token, body: { status: 'Invalid' } })).status, 400);
  for (const status of ['Approved', 'Rejected']) {
    assert.equal((await call(route, { method: 'PUT', token: donor.token, body: { status } })).data.status, status);
    assert.equal((await call('/api/requests/user/' + requester.user.id, { token: requester.token })).data[0].status, status);
  }
  assert.equal((await call('/api/donations/' + donation._id, { method: 'DELETE', token: stranger.token })).status, 403);
  assert.equal((await call('/api/donations/' + donation._id, { method: 'DELETE', token: donor.token })).status, 204);
  assert.equal((await call('/api/requests', { token: requester.token })).data.length, 0);
});
