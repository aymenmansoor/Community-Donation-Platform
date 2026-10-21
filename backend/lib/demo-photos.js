const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const manifest = require('../fixtures/photos/manifest.json');
const hash = buffer => crypto.createHash('sha256').update(buffer).digest('hex');
async function attachDemoPhotos(Donation, uploadDir) {
  const planned = [];
  // Preflight every target and asset before the first write. Never create or replace a donation.
  for (const photo of manifest.photos) {
    const matches = await Donation.find({ donorEmail: 'mira.donor@example.test', itemName: photo.itemName }).lean();
    if (matches.length !== 1 || matches[0].category !== photo.category) throw new Error('Missing or ambiguous fictional fixture: ' + photo.itemName);
    if (path.basename(photo.file) !== photo.file) throw new Error('Invalid fixture filename');
    const bytes = await fs.readFile(path.join(__dirname, '../fixtures/photos', photo.file));
    if (hash(bytes) !== photo.sha256) throw new Error('Fixture checksum mismatch');
    planned.push({ photo, donation: matches[0], bytes });
  }
  await fs.mkdir(uploadDir, { recursive: true });
  const result = { attached: 0, preserved: 0, ids: [] };
  for (const { photo, donation, bytes } of planned) {
    result.ids.push(String(donation._id));
    if (donation.image) { result.preserved++; continue; }
    const name = `demo-pexels-${photo.photoId}-${photo.sha256.slice(0, 12)}.webp`;
    const target = path.join(uploadDir, name);
    try { await fs.writeFile(target, bytes, { flag: 'wx' }); }
    catch (error) {
      if (error.code !== 'EEXIST' || hash(await fs.readFile(target)) !== photo.sha256) throw error;
    }
    const updated = await Donation.updateOne({ _id: donation._id, donorEmail: donation.donorEmail, image: { $in: [null, ''] } }, { $set: { image: name } });
    if (updated.modifiedCount === 1) result.attached++;
    else result.preserved++; // A concurrent genuine upload always wins.
  }
  return result;
}
module.exports = { attachDemoPhotos };
