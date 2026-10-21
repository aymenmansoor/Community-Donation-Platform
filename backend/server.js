require('dotenv').config({ quiet: true });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const User = require('./models/User');
const Donation = require('./models/Donation');
const Request = require('./models/Request');
const auth = require('./middleware/auth');
const app = express();
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('Referrer-Policy', 'no-referrer');
  next();
});
const origins = (process.env.CORS_ORIGIN || 'http://localhost:3000,http://127.0.0.1:3000').split(',').map(s => s.trim());
app.use(cors({ origin(origin, cb) { cb(null, !origin || origins.includes(origin)); } }));
app.use(express.json({ limit: '32kb' }));
app.get('/api/health', (req, res) => res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({ status: mongoose.connection.readyState === 1 ? 'ok' : 'unavailable', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));
const uploadDir = path.resolve(process.env.UPLOAD_DIR || path.join(__dirname, 'uploads'));
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 6 } });
app.use('/uploads', express.static(uploadDir, { dotfiles: 'deny', setHeaders(res) { res.set('Content-Security-Policy', "default-src 'none'; sandbox"); } }));
// Small single-instance auth throttle. Use a shared gateway limiter for a scaled deployment.
const attempts = new Map();
const sweep = setInterval(() => { for (const [key, value] of attempts) if (value.until < Date.now()) attempts.delete(key); }, 60000);
sweep.unref();
app.use('/api/auth', (req, res, next) => {
  const key = req.ip;
  let entry = attempts.get(key);
  if (!entry || entry.until < Date.now()) { entry = { count: 0, until: Date.now() + 60000 }; attempts.set(key, entry); }
  if (++entry.count > 30) return res.status(429).json({ message: 'Too many attempts. Try again shortly.' });
  next();
});
const publicUser = user => ({ id: user._id, fullName: user.fullName, email: user.email, role: user.role });
app.post('/api/auth/signup', async (req, res) => {
  const { fullName, email, password, role = 'Donor' } = req.body;
  if (typeof fullName !== 'string' || !fullName.trim() || fullName.length > 100 || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || typeof password !== 'string' || password.length < 12 || Buffer.byteLength(password) > 72 || !['Donor', 'Requester'].includes(role)) return res.status(400).json({ message: 'Valid name, email, role and password (12–72 bytes) required' });
  const normalizedEmail = email.trim().toLowerCase();
  if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ message: 'Email already registered' });
  await User.create({ fullName: fullName.trim(), email: normalizedEmail, password: await bcrypt.hash(password, 12), role });
  res.status(201).json({ message: 'Account created. Please sign in.' });
});
app.post('/api/auth/login', async (req, res) => {
  if (typeof req.body.email !== 'string' || typeof req.body.password !== 'string' || Buffer.byteLength(req.body.password) > 72) return res.status(400).json({ message: 'Email and password required' });
  const user = await User.findOne({ email: req.body.email.trim().toLowerCase() });
  if (!user || !await bcrypt.compare(req.body.password, user.password)) return res.status(401).json({ message: 'Invalid email or password' });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '1h' });
  res.json({ token, user: publicUser(user) });
});
app.post('/api/donate', auth, (req, res, next) => {
  if (req.user.role !== 'Donor') return res.status(403).json({ message: 'Donor account required' });
  next();
}, upload.single('image'), async (req, res) => {
  const { itemName, category, description, contact = 'Not shared' } = req.body;
  if (![itemName, description, category, contact].every(v => typeof v === 'string') || !itemName.trim() || itemName.length > 120 || !description.trim() || description.length > 2000 || contact.length > 80 || !['Clothes', 'Books', 'Toys', 'Other'].includes(category)) return res.status(400).json({ message: 'Valid item, category, description and contact required' });
  let image = null;
  if (req.file) {
    const b = req.file.buffer;
    const png = b.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
    const jpg = b[0] === 255 && b[1] === 216 && b[2] === 255;
    const webp = b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP';
    if (!png && !jpg && !webp) return res.status(400).json({ message: 'Only PNG, JPEG or WebP images are allowed' });
    image = `${crypto.randomUUID()}.${png ? 'png' : jpg ? 'jpg' : 'webp'}`;
    await fs.promises.writeFile(path.join(uploadDir, image), b);
  }
  try {
    const donation = await Donation.create({ itemName: itemName.trim(), category, description: description.trim(), contact: contact.trim() || 'Not shared', donorEmail: req.user.email, image });
    res.status(201).json(donation);
  } catch (error) {
    if (image) await fs.promises.unlink(path.join(uploadDir, image)).catch(() => {});
    throw error;
  }
});
app.get('/api/donations', auth, async (req, res) => res.json(await Donation.find().sort({ createdAt: -1 })));
app.delete('/api/donations/:id', auth, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid item ID' });
  const item = await Donation.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Item not found' });
  if (req.user.role !== 'Donor' || item.donorEmail !== req.user.email) return res.status(403).json({ message: 'Access denied' });
  await Request.deleteMany({ itemId: item._id });
  await item.deleteOne();
  if (item.image && path.basename(item.image) === item.image) await fs.promises.unlink(path.join(uploadDir, item.image)).catch(() => {});
  res.sendStatus(204);
});
app.use('/api/requests', require('./routes/requestRoutes'));
app.use((err, req, res, next) => {
  const status = err instanceof multer.MulterError ? 400 : err.code === 11000 ? 409 : err.name === 'ValidationError' || err.type === 'entity.parse.failed' ? 400 : err.status === 413 ? 413 : 500;
  if (status === 500) console.error('Request failed:', err.name);
  res.status(status).json({ message: status === 500 ? 'Internal server error' : status === 409 ? 'Record already exists' : 'Invalid request or upload' });
});
async function start() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must contain at least 32 characters');
  if (process.env.NODE_ENV === 'production' && (!process.env.MONGO_URI || !process.env.CORS_ORIGIN || origins.some(s => !s.startsWith('https://')) || !process.env.UPLOAD_DIR)) throw new Error('Production requires MONGO_URI, HTTPS CORS_ORIGIN and persistent UPLOAD_DIR');
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/community_donation', { serverSelectionTimeoutMS: 10000 });
  await User.init();
  console.log('MongoDB connected');
  const server = app.listen(process.env.PORT || 5000, process.env.HOST || '127.0.0.1', () => console.log(`API listening on ${process.env.PORT || 5000}`));
  server.on('error', error => { console.error('Listen failed:', error.code); process.exit(1); });
  for (const signal of ['SIGTERM', 'SIGINT']) process.once(signal, () => server.close(async () => { await mongoose.disconnect(); process.exit(0); }));
}
if (require.main === module) start().catch(err => { console.error('Startup failed:', err.message); process.exit(1); });
module.exports = { app, start };
