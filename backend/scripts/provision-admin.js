require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const AuditEvent = require('../models/AuditEvent');
const { emailValid, passwordValid } = require('../routes/authRoutes');
async function main() {
  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME, MONGO_URI } = process.env;
  if (!emailValid(ADMIN_EMAIL) || !passwordValid(ADMIN_PASSWORD) || !ADMIN_NAME?.trim() || ADMIN_NAME.length > 100 || !MONGO_URI) throw new Error('Private ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME and MONGO_URI required');
  await mongoose.connect(MONGO_URI);
  await User.init();
  if (await User.exists({ role: 'Admin' })) throw new Error('An admin already exists; no account changed');
  if (await User.exists({ email: ADMIN_EMAIL.trim().toLowerCase() })) throw new Error('Email already in use; ordinary accounts are never promoted by this tool');
  const user = await User.create({ fullName: ADMIN_NAME.trim(), email: ADMIN_EMAIL.trim().toLowerCase(), password: await bcrypt.hash(ADMIN_PASSWORD, 12), role: 'Admin' });
  await AuditEvent.create({ actor: user._id, action: 'admin.provision', target: String(user._id) });
  console.log('Initial administrator provisioned. No credentials printed.');
}
if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => mongoose.disconnect());
module.exports = main;
