const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Session = require('../models/Session');
const auth = require('../middleware/auth');
const { issue, clear } = require('../lib/sessions');
const audit = require('../lib/audit');
const publicUser = user => ({ id: user._id, fullName: user.fullName, email: user.email, role: user.role });
const emailValid = value => typeof value === 'string' && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
const passwordValid = value => typeof value === 'string' && value.length >= 12 && Buffer.byteLength(value) <= 72;
// Same cost as real verification, including for missing/suspended accounts.
const dummyHash = bcrypt.hashSync(require('crypto').randomBytes(24).toString('hex'), 12);
router.post('/signup', async (req, res) => {
  const { fullName, email, password, role = 'Donor' } = req.body;
  if (typeof fullName !== 'string' || !fullName.trim() || fullName.length > 100 || !emailValid(email) || !passwordValid(password) || !['Donor','Requester'].includes(role)) return res.status(400).json({ message: 'Valid name, email, role and password (12–72 bytes) required' });
  const normalizedEmail = email.trim().toLowerCase();
  const hashed = await bcrypt.hash(password, 12);
  try {
    if (!await User.exists({ email: normalizedEmail })) {
      const user = await User.create({ fullName: fullName.trim(), email: normalizedEmail, password: hashed, role });
      await audit(req, 'account.register', user._id);
    }
  } catch (error) { if (error.code !== 11000) throw error; }
  // An identical response prevents registration-based account enumeration.
  res.status(201).json({ message: 'If registration is available, your account is ready. Please sign in.' });
});
router.post('/login', async (req, res) => {
  if (!emailValid(req.body.email) || typeof req.body.password !== 'string' || Buffer.byteLength(req.body.password) > 72) return res.status(401).json({ message: 'Invalid email or password' });
  const user = await User.findOne({ email: req.body.email.trim().toLowerCase() });
  const valid = await bcrypt.compare(req.body.password, user && user.status !== 'suspended' ? user.password : dummyHash);
  if (!valid || !user || user.status === 'suspended') {
    await audit(req, 'login.failed', '', 'denied'); return res.status(401).json({ message: 'Invalid email or password' });
  }
  const session = await issue(req, res, user);
  req.user = user; await audit(req, 'login.success', user._id);
  res.json({ ...session, user: publicUser(user) });
});
router.get('/session', auth, (req, res) => { res.set('Cache-Control', 'no-store'); res.json({ user: publicUser(req.user), csrfToken: req.session.csrf }); });
router.post('/logout', auth, async (req, res) => {
  await Session.deleteOne({ _id: req.session._id }); clear(res);
  await audit(req, 'logout', req.user._id); res.sendStatus(204);
});
module.exports = router;
module.exports.passwordValid = passwordValid;
module.exports.emailValid = emailValid;
