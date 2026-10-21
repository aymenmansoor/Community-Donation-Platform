require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const path = require('path');
const Donation = require('../models/Donation');
const { attachDemoPhotos } = require('../lib/demo-photos');
async function main() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/community_donation';
  if (!uri.startsWith('mongodb://127.0.0.1:') && process.env.ALLOW_DEMO_SEED !== 'true') throw new Error('Non-local fixture updates require explicit approval and ALLOW_DEMO_SEED=true');
  await mongoose.connect(uri);
  const result = await attachDemoPhotos(Donation, path.resolve(process.env.UPLOAD_DIR || path.join(__dirname, '../uploads')));
  console.log(JSON.stringify(result));
}
if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => mongoose.disconnect());
