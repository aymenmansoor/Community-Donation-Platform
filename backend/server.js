require('dotenv').config({ quiet: true });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const security = require('./middleware/security');
const { uploadDir } = require('./lib/uploads');
const User = require('./models/User');
const app = express();
app.disable('x-powered-by');
app.use(security.headers);
app.use('/api', security.apiLimit);
const origins = (process.env.CORS_ORIGIN || 'http://localhost:3000,http://127.0.0.1:3000').split(',').map(s => s.trim());
app.use(cors({ credentials: true, origin(origin, cb) { cb(null, !origin || origins.includes(origin)); } }));
app.use('/api', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
app.use(express.json({ limit: '32kb' }));
app.use(security.inputGuard);
app.use((req, res, next) => {
  if (!['GET','HEAD','OPTIONS'].includes(req.method) && req.headers.origin && !origins.includes(req.headers.origin)) return res.status(403).json({ message: 'Origin not allowed' });
  next();
});
app.get('/api/health', (req, res) => res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({ status: mongoose.connection.readyState === 1 ? 'ok' : 'unavailable', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));
app.use('/uploads', express.static(uploadDir, { dotfiles: 'deny', setHeaders(res) { res.set('Content-Security-Policy', "default-src 'none'; sandbox"); } }));
app.use(['/api/auth/login','/api/auth/signup'], security.authLimit);
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api', require('./routes/donationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api', (req, res) => res.status(404).json({ message: 'Endpoint not found' }));
app.use((err, req, res, next) => {
  const status = err instanceof multer.MulterError ? 400 : err.code === 11000 ? 409 : err.name === 'ValidationError' || err.type === 'entity.parse.failed' ? 400 : [400, 413].includes(err.status) ? err.status : 500;
  if (status === 500) console.error(JSON.stringify({ event: 'request.error', type: err.name }));
  res.status(status).json({ message: status === 500 ? 'Internal server error' : status === 409 ? 'Record already exists' : 'Invalid request or upload' });
});
async function start() {
  require('./lib/config')();
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/community_donation', { serverSelectionTimeoutMS: 10000 });
  await User.init();
  await require('./models/Session').init();
  console.log('MongoDB connected');
  const server = app.listen(process.env.PORT || 5000, process.env.HOST || '127.0.0.1', () => console.log(`API listening on ${process.env.PORT || 5000}`));
  server.on('error', error => { console.error('Listen failed:', error.code); process.exit(1); });
  for (const signal of ['SIGTERM', 'SIGINT']) process.once(signal, () => server.close(async () => { await mongoose.disconnect(); process.exit(0); }));
}
if (require.main === module) start().catch(err => { console.error('Startup failed:', err.code === 'CONFIG' ? err.message : err.name); process.exit(1); });
module.exports = { app, start };
