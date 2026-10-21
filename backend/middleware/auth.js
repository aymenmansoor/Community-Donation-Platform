const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const Session = require('../models/Session');
const { credentials, hash, clear } = require('../lib/sessions');
const audit = require('../lib/audit');
module.exports = async (req, res, next) => {
  const { token, cookie } = credentials(req);
  if (!token) return res.status(401).json({ message: 'Sign in required' });
  let payload;
  try { payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'], issuer: 'sharebloom', audience: 'sharebloom-api' }); }
  catch { clear(res); return res.status(401).json({ message: 'Invalid or expired session' }); }
  if (!mongoose.isObjectIdOrHexString(payload.id)) return res.status(401).json({ message: 'Invalid session' });
  try {
    const session = await Session.findOne({ tokenHash: hash(token), userId: payload.id, expiresAt: { $gt: new Date() } });
    req.user = await User.findById(payload.id).select('-password');
    if (!session || !req.user || req.user.status === 'suspended') {
      clear(res); return res.status(401).json({ message: 'Session unavailable. Please sign in again.' });
    }
    if (cookie && !['GET','HEAD','OPTIONS'].includes(req.method) && req.headers['x-csrf-token'] !== session.csrf) {
      await audit(req, 'csrf.denied', '', 'denied');
      return res.status(403).json({ message: 'Invalid session request. Refresh and retry.' });
    }
    req.session = session;
    next();
  } catch (error) { next(error); }
};
module.exports.roles = (...roles) => async (req, res, next) => {
  if (roles.includes(req.user?.role)) return next();
  await audit(req, 'access.denied', '', 'denied');
  res.status(403).json({ message: 'Access denied' });
};
