const { test } = require('node:test');
const assert = require('node:assert/strict');
const { unsafe, limiter } = require('../middleware/security');
const { saveImage, removeImage } = require('../lib/uploads');
test('reject nested MongoDB operators, dotted keys and prototype keys', () => {
  for (const data of [{ email: { $ne: '' } }, { 'user.role': 'Admin' }, JSON.parse('{"__proto__":{}}'), { a: [{ $where: 'x' }] }]) assert.equal(unsafe(data), true);
  assert.equal(unsafe({ reason: 'A normal $5 item.' }), false);
});
test('reject fake image headers, SVG and malformed files; re-encode real images', async () => {
  for (const data of ['<svg/>', '\xff\xd8\xff<script>']) await assert.rejects(saveImage({ buffer: Buffer.from(data) }));
  const png = await require('sharp')({ create: { width: 2, height: 2, channels: 3, background: 'green' } }).png().toBuffer();
  const name = await saveImage({ buffer: png });
  assert.match(name, /^[a-f0-9-]+\.webp$/); await removeImage(name);
});
test('rate limits return 429 and standard headers', async () => {
  const express = require('express'); const app = express(); app.use(limiter(1, 60000)); app.get('/', (q,s) => s.json({ ok: true }));
  const server = app.listen(0, '127.0.0.1'); await new Promise(r => server.once('listening', r));
  try { const url = `http://127.0.0.1:${server.address().port}`; assert.equal((await fetch(url)).status, 200);
    // Audit logging is best-effort when database is intentionally absent in this isolated unit check.
    require('../models/AuditEvent').create = async () => {};
    const limited = await fetch(url); assert.equal(limited.status, 429); assert(limited.headers.has('ratelimit'));
  } finally { await new Promise(r => server.close(r)); }
});
