const router = require('express').Router();
const mongoose = require('mongoose');
const Request = require('../models/Request');
const Donation = require('../models/Donation');
router.use(require('../middleware/auth'));
const validId = id => mongoose.isValidObjectId(id);
async function visible(req) {
  if (req.user.role === 'Requester') return { requesterId: req.user._id };
  const items = await Donation.find({ donorEmail: req.user.email }).select('_id');
  return { itemId: { $in: items.map(item => item._id) } };
}
router.get('/', async (req, res) => res.json(await Request.find(await visible(req)).populate('itemId')));
router.get('/user/:userId', async (req, res) => {
  if (String(req.user._id) !== req.params.userId) return res.status(403).json({ message: 'Access denied' });
  res.json(await Request.find({ requesterId: req.user._id }).populate('itemId'));
});
router.get('/donor/:email', async (req, res) => {
  if (req.user.role !== 'Donor' || req.user.email !== req.params.email) return res.status(403).json({ message: 'Access denied' });
  res.json(await Request.find(await visible(req)).populate('itemId'));
});
router.post('/', async (req, res) => {
  if (req.user.role !== 'Requester') return res.status(403).json({ message: 'Requester account required' });
  if (!validId(req.body.itemId) || typeof req.body.reason !== 'string' || !req.body.reason.trim() || req.body.reason.length > 1500) return res.status(400).json({ message: 'Valid item and reason required' });
  const item = await Donation.findById(req.body.itemId);
  if (!item) return res.status(404).json({ message: 'Item not found' });
  if (await Request.exists({ itemId: item._id, requesterId: req.user._id })) return res.status(409).json({ message: 'You already requested this item' });
  const request = await Request.create({ itemId: item._id, requesterId: req.user._id, requesterName: req.user.fullName, donorEmail: item.donorEmail, reason: req.body.reason.trim(), status: 'Pending' });
  res.status(201).json(request);
});
router.put('/:id', async (req, res) => {
  if (req.user.role !== 'Donor') return res.status(403).json({ message: 'Donor account required' });
  if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid request ID' });
  if (!['Approved', 'Rejected'].includes(req.body.status)) return res.status(400).json({ message: 'Choose Approved or Rejected' });
  const request = await Request.findById(req.params.id).populate('itemId');
  if (!request) return res.status(404).json({ message: 'Request not found' });
  if (request.itemId?.donorEmail !== req.user.email) return res.status(403).json({ message: 'Access denied' });
  request.status = req.body.status;
  await request.save();
  res.json(request);
});
module.exports = router;
