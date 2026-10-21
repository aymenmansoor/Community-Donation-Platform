require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Donation = require('../models/Donation');
const Request = require('../models/Request');
const accounts = [
  { fullName: 'Mira Willow', email: 'mira.donor@example.test', role: 'Donor' },
  { fullName: 'Rowan Vale', email: 'rowan.requester@example.test', role: 'Requester' },
  { fullName: 'Ellis Fern', email: 'ellis.requester@example.test', role: 'Requester' }
];
const listings = [
  ['Science textbook collection', 'Books', 'Six gently used secondary-school science textbooks. Clean pages, useful diagrams, and a complete set for a new term.'],
  ['Warm winter layers', 'Clothes', 'Three freshly washed adult sweaters in medium size. Good condition, ready for a new home before winter.'],
  ['Wooden building blocks', 'Toys', 'A complete set of 48 smooth wooden blocks in a storage box. Suitable for supervised play, ages 3 and up.'],
  ['Adjustable study lamp', 'Other', 'Working desk lamp with adjustable arm and included LED bulb. Ideal for a small study corner.'],
  ['Children’s storybook bundle', 'Books', 'Eight illustrated storybooks for early readers. All pages intact; a few light marks on the covers.'],
  ['Everyday kitchen starter set', 'Other', 'Four plates, two bowls, and a small saucepan. Clean, practical basics for someone setting up a first home.']
];
async function main() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/community_donation';
  if (!uri.startsWith('mongodb://127.0.0.1:') && process.env.ALLOW_DEMO_SEED !== 'true') throw new Error('Non-local seeding requires explicit ALLOW_DEMO_SEED=true');
  if (!process.env.DEMO_PASSWORD || process.env.DEMO_PASSWORD.length < 12 || Buffer.byteLength(process.env.DEMO_PASSWORD) > 72) throw new Error('Set a private DEMO_PASSWORD of 12–72 bytes');
  await mongoose.connect(uri);
  await User.init();
  const users = [];
  for (const account of accounts) {
    let user = await User.findOne({ email: account.email });
    if (!user) user = await User.create({ ...account, password: await bcrypt.hash(process.env.DEMO_PASSWORD, 12) });
    users.push(user);
  }
  const items = [];
  for (const [itemName, category, description] of listings) {
    items.push(await Donation.findOneAndUpdate({ itemName, donorEmail: users[0].email }, { $setOnInsert: { category, description, contact: 'Not shared — fictional demo listing', image: null } }, { upsert: true, new: true, runValidators: true }));
  }
  const reasons = ['Our fictional after-school study group could use these books for shared lessons.', 'These warm layers would help a fictional household prepare for colder weather.', 'I am setting up a fictional community play corner and would love to include these blocks.'];
  for (let i = 0; i < 3; i++) {
    await Request.findOneAndUpdate({ itemId: items[i]._id, requesterId: users[1]._id }, { $setOnInsert: { requesterName: users[1].fullName, donorEmail: users[0].email, reason: reasons[i], status: ['Pending','Approved','Rejected'][i] } }, { upsert: true, new: true, runValidators: true });
  }
  console.log('Demo fixtures ready: 3 fictional accounts, 6 listings, and 3 requests. Existing records preserved.');
}
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => mongoose.disconnect());
