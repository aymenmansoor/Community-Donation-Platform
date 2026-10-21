require('dotenv').config({ quiet: true });
const fs = require('fs/promises');
const path = require('path');
const mongoose = require('mongoose');
const Donation = require('../models/Donation');
const User = require('../models/User');
async function main() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/community_donation';
  if (!uri.startsWith('mongodb://127.0.0.1:') && process.env.ALLOW_DEMO_SEED !== 'true') throw new Error('Non-local seeding requires explicit approval and ALLOW_DEMO_SEED=true');
  await mongoose.connect(uri);
  const donor = await User.findOne({ email: 'mira.donor@example.test', role: 'Donor' });
  if (!donor) throw new Error('Run the fictional account seed first');
  const uploadDir = path.resolve(process.env.UPLOAD_DIR || path.join(__dirname, '../uploads'));
  await fs.mkdir(uploadDir, { recursive: true });
  for (const [itemName, file, description] of [
    ['Porcelain cup and saucer', 'cup.webp', 'A white porcelain cup and matching saucer for a small kitchen. Fictional demo listing with a representative CC0 photograph; coffee is not included.'],
    ['Wall clock for a study space', 'clock.webp', 'A simple round wall clock for a quiet study corner. Fictional demo listing; the public-domain representative photograph has natural motion blur.']
  ]) {
    const existing = await Donation.findOne({ itemName, donorEmail: donor.email });
    if (existing?.image) continue;
    const image = 'demo-' + file;
    // Exclusive creation preserves any pre-existing uploaded file at the destination.
    await fs.copyFile(path.join(__dirname, '../fixtures/photos', file), path.join(uploadDir, image), require('fs').constants.COPYFILE_EXCL).catch(error => { if (error.code !== 'EEXIST') throw error; });
    if (existing) { existing.image = image; await existing.save(); }
    else await Donation.create({ itemName, category: 'Other', description, contact: 'Not shared — fictional demo listing', donorEmail: donor.email, image });
  }
  console.log('Two licensed photograph listings prepared; existing records and genuine uploads preserved.');
}
if (require.main === module) main().catch(e => { console.error(e.message); process.exitCode = 1; }).finally(() => mongoose.disconnect());
module.exports = main;
