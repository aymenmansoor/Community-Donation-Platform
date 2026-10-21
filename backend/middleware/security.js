const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const audit = require('../lib/audit');
function unsafe(value, depth = 0) {
  if (depth > 12) return true;
  if (!value || typeof value !== 'object') return false;
  return Object.keys(value).some(key => /[.$\[\]]/.test(key) || ['__proto__', 'prototype', 'constructor'].includes(key) || unsafe(value[key], depth + 1));
}
function inputGuard(req, res, next) {
  if (unsafe(req.body) || unsafe(req.query)) return res.status(400).json({ message: 'Invalid input' });
  next();
}
function limiter(limit, windowMs) {
  return rateLimit({ windowMs, limit, standardHeaders: 'draft-8', legacyHeaders: false,
    handler: async (req, res) => {
      await audit(req, 'rate_limit', '', 'denied').catch(() => {});
      res.status(429).json({ message: 'Too many attempts. Try again later.' });
    }
  });
}
module.exports = { inputGuard, unsafe, headers: helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }),
  apiLimit: limiter(180, 60000), authLimit: limiter(30, 15 * 60000),
  requestLimit: limiter(20, 3600000), uploadLimit: limiter(20, 15 * 60000), limiter };
