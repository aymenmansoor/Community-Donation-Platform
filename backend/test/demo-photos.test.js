const { test } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { attachDemoPhotos } = require('../lib/demo-photos');
const manifest = require('../fixtures/photos/manifest.json');
test('photo attachment preserves existing images, records and requests and is idempotent', async () => {
  const connection = await mongoose.createConnection('mongodb://127.0.0.1:27017/photo_test_' + crypto.randomUUID().replaceAll('-', '')).asPromise();
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'photo-test-'));
  try {
    const Donation = connection.model('Donation', new mongoose.Schema({ itemName: String, category: String, donorEmail: String, image: String, description: String }));
    const rows = await Donation.insertMany(manifest.photos.map((p, i) => ({ itemName: p.itemName, category: p.category, donorEmail: 'mira.donor@example.test', image: i === 0 ? 'genuine.webp' : null, description: 'Preserve this text' })));
    await fs.writeFile(path.join(dir, 'genuine.webp'), 'existing uploaded bytes');
    await connection.collection('requests').insertOne({ donationId: rows[0]._id, status: 'Approved' });
    const before = JSON.parse(JSON.stringify(await Donation.find().sort({ _id: 1 }).lean()));
    const requests = JSON.parse(JSON.stringify(await connection.collection('requests').find().toArray()));
    assert.equal((await attachDemoPhotos(Donation, dir)).attached, 5);
    assert.equal((await attachDemoPhotos(Donation, dir)).attached, 0);
    assert.equal(await fs.readFile(path.join(dir, 'genuine.webp'), 'utf8'), 'existing uploaded bytes');
    const after = JSON.parse(JSON.stringify(await Donation.find().sort({ _id: 1 }).lean()));
    assert.equal(after[0].image, 'genuine.webp');
    for (let i = 0; i < before.length; i++) { delete before[i].image; delete after[i].image; }
    assert.deepEqual(after, before);
    assert.deepEqual(JSON.parse(JSON.stringify(await connection.collection('requests').find().toArray())), requests);
    await Donation.create({ ...manifest.photos[0], donorEmail: 'mira.donor@example.test' });
    const filesBefore = await fs.readdir(dir);
    await assert.rejects(attachDemoPhotos(Donation, dir), /ambiguous/);
    assert.deepEqual(await fs.readdir(dir), filesBefore);
  } finally {
    await connection.dropDatabase();
    await connection.close();
    await fs.rm(dir, { recursive: true, force: true });
  }
});
