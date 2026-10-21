const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { parse } = require('cookie');
const Session = require('../models/Session');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const options = () => ({ httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/api' });
const cookieName = () => process.env.NODE_ENV === 'production' ? '__Secure-sharebloom_session' : 'sharebloom_session';
function credentials(req) {
  const bearer = req.headers.authorization?.match(/^Bearer ([^\s]+)$/)?.[1];
  return { token: bearer || parse(req.headers.cookie || '')[cookieName()], cookie: !bearer };
}
async function issue(req, res, user) {
  const token = jwt.sign({ id: String(user._id) }, process.env.JWT_SECRET, { algorithm: 'HS256', issuer: 'sharebloom', audience: 'sharebloom-api', expiresIn: '1h', jwtid: crypto.randomUUID() });
  const csrf = crypto.randomBytes(32).toString('hex');
  await Session.create({ userId: user._id, tokenHash: hash(token), csrf, expiresAt: new Date(Date.now() + 3600000) });
  res.cookie(cookieName(), token, { ...options(), maxAge: 3600000 });
  return { csrfToken: csrf, ...(req.headers['x-session-transport'] === 'bearer' ? { token } : {}) };
}
const clear = res => res.clearCookie(cookieName(), options());
module.exports = { credentials, issue, clear, hash };
