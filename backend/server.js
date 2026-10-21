require('dotenv').config({ quiet: true });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const security = require('./middleware/security');
const audit = require('./lib/audit');
const { upload, uploadDir, saveImage, removeImage } = require('./lib/uploads');
const User = require('./models/User');
const Donation = require('./models/Donation');
const Request = require('./models/Request');
const auth = require('./middleware/auth');
const app = express();
app.disable('x-powered-by');
app.use(security.headers);
app.use('/api', security.apiLimit);
const origins = (process.env.CORS_ORIGIN || 'http://localhost:3000,http://127.0.0.1:3000').split(',').map(s => s.trim());
app.use(cors({ origin(origin, cb) { cb(null, !origin || origins.includes(origin)); } }));
app.use('/api', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
app.use(express.json({ limit: '32kb' }));
app.use(security.inputGuard);
app.use((req, res, next) => {
  if (!['GET','HEAD','OPTIONS'].includes(req.method) && req.headers.origin && !origins.includes(req.headers.origin)) return res.status(403).json({ message: 'Origin not allowed' });
  next();
});
app.get('/api/health', (req, res) => res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({ status: mongoose.connection.readyState === 1 ? 'ok' : 'unavailable', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));
app.use('/uploads', express.static(uploadDir, { dotfiles: 'deny', setHeaders(res) { res.set('Content-Security-Policy', "default-src 'none'; sandbox"); } }));
app.use('/api/auth', security.authLimit);
app.use('/api/auth', require('./routes/authRoutes'));
app.post('/api/donate', auth, (req, res, next) => {
  if (req.user.role !== 'Donor') return res.status(403).json({ message: 'Donor account required' });
  next();
}, security.uploadLimit, upload.single('image'), security.inputGuard, async (req, res) => {
  const { itemName, category, description, contact = 'Not shared' } = req.body;
  if (![itemName, description, category, contact].every(v => typeof v === 'string') || !itemName.trim() || itemName.length > 120 || !description.trim() || description.length > 2000 || contact.length > 80 || !['Clothes', 'Books', 'Toys', 'Other'].includes(category)) return res.status(400).json({ message: 'Valid item, category, description and contact required' });
  const image = await saveImage(req.file);
  try {
    const donation = await Donation.create({ itemName: itemName.trim(), category, description: description.trim(), contact: contact.trim() || 'Not shared', donorEmail: req.user.email, image });
    await audit(req, 'donation.create', donation._id);
    res.status(201).json(donation);
  } catch (error) {
    if (image) await removeImage(image);
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
  await audit(req, 'donation.delete', item._id);
  await removeImage(item.image);
  res.sendStatus(204);
});
app.use('/api/requests', require('./routes/requestRoutes'));
app.use((err, req, res, next) => {
  const status = err instanceof multer.MulterError ? 400 : err.code === 11000 ? 409 : err.name === 'ValidationError' || err.type === 'entity.parse.failed' ? 400 : [400, 413].includes(err.status) ? err.status : 500;
  if (status === 500) console.error(JSON.stringify({ event: 'request.error', type: err.name }));
  res.status(status).json({ message: status === 500 ? 'Internal server error' : status === 409 ? 'Record already exists' : 'Invalid request or upload' });
});
async function start() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must contain at least 32 characters');
  if (process.env.NODE_ENV === 'production' && (!process.env.MONGO_URI || !process.env.CORS_ORIGIN || origins.some(s => !s.startsWith('https://')) || !process.env.UPLOAD_DIR)) throw new Error('Production requires MONGO_URI, HTTPS CORS_ORIGIN and persistent UPLOAD_DIR');
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/community_donation', { serverSelectionTimeoutMS: 10000 });
  await User.init();
  await require('./models/Session').init();
  console.log('MongoDB connected');
  const server = app.listen(process.env.PORT || 5000, process.env.HOST || '127.0.0.1', () => console.log(`API listening on ${process.env.PORT || 5000}`));
  server.on('error', error => { console.error('Listen failed:', error.code); process.exit(1); });
  for (const signal of ['SIGTERM', 'SIGINT']) process.once(signal, () => server.close(async () => { await mongoose.disconnect(); process.exit(0); }));
}
if (require.main === module) start().catch(err => { console.error('Startup failed:', err.message); process.exit(1); });
module.exports = { app, start };
