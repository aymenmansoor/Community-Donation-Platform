const router = require('express').Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Donation = require('../models/Donation');
const Request = require('../models/Request');
const AuditEvent = require('../models/AuditEvent');
const Session = require('../models/Session');
const auth = require('../middleware/auth');
const audit = require('../lib/audit');
router.use(auth, auth.roles('Admin'));
function pageQuery(req, res, next) {
  if (req.query.page && !/^[1-9]\d{0,5}$/.test(req.query.page)) return res.status(400).json({ message: 'Invalid page' });
  req.page = Number(req.query.page || 1); next();
}
router.use(pageQuery);
async function list(model, query, req, res, populate) {
  const total = await model.countDocuments(query);
  let cursor = model.find(query).sort({ createdAt: -1, _id: -1 }).skip((req.page - 1) * 25).limit(25);
  if (model === User) cursor = cursor.select('fullName email role status createdAt');
  if (populate) cursor = cursor.populate(populate);
  res.json({ items: await cursor, total, page: req.page, pages: Math.max(1, Math.ceil(total / 25)) });
}
router.get('/stats', async (req, res) => {
  const [users, donors, requesters, suspended, donations, requests, categories, statuses] = await Promise.all([
    User.countDocuments(), User.countDocuments({ role: 'Donor' }), User.countDocuments({ role: 'Requester' }), User.countDocuments({ status: 'suspended' }),
    Donation.countDocuments(), Request.countDocuments(), Donation.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]), Request.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
  ]);
  res.json({ users, donors, requesters, suspended, donations, requests, categories, statuses });
});
router.get('/users', async (req, res) => {
  if (req.query.search && (typeof req.query.search !== 'string' || req.query.search.length > 100)) return res.status(400).json({ message: 'Invalid search' });
  const search = (req.query.search || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const query = search ? { $or: [{ fullName: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] } : {};
  await list(User, query, req, res);
});
router.patch('/users/:id', async (req, res) => {
  if (!mongoose.isObjectIdOrHexString(req.params.id) || Object.keys(req.body).some(k => k !== 'status') || !['active','suspended'].includes(req.body.status)) return res.status(400).json({ message: 'Only active/suspended status may be changed' });
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.role === 'Admin') return res.status(403).json({ message: 'Administrator accounts cannot be changed here' });
  await audit(req, 'admin.user.' + req.body.status, user._id);
  user.status = req.body.status; await user.save();
  await Session.deleteMany({ userId: user._id });
  res.json({ id: user._id, status: user.status });
});
router.get('/donations', (req, res) => list(Donation, {}, req, res));
router.patch('/donations/:id', async (req, res) => {
  const { moderationStatus, reason } = req.body;
  if (!mongoose.isObjectIdOrHexString(req.params.id) || Object.keys(req.body).some(k => !['moderationStatus','reason'].includes(k)) || !['published','hidden'].includes(moderationStatus) || typeof reason !== 'string' || !reason.trim() || reason.length > 500) return res.status(400).json({ message: 'Valid moderation status and reason required' });
  const item = await Donation.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Item not found' });
  await audit(req, 'admin.donation.' + moderationStatus, item._id);
  item.moderationStatus = moderationStatus; item.moderationReason = reason.trim(); await item.save();
  res.json(item);
});
router.get('/requests', (req, res) => list(Request, {}, req, res, 'itemId'));
router.get('/audit', (req, res) => list(AuditEvent, {}, req, res, { path: 'actor', select: 'fullName role' }));
module.exports = router;
