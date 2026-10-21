const router = require('express').Router();
const mongoose = require('mongoose');
const Donation = require('../models/Donation');
const Request = require('../models/Request');
const auth = require('../middleware/auth');
const security = require('../middleware/security');
const audit = require('../lib/audit');
const { upload, saveImage, removeImage } = require('../lib/uploads');
router.post('/donate', auth, (req, res, next) => {
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
router.get('/donations', auth, async (req, res) => res.json(await Donation.find(req.user.role === 'Admin' ? {} : { $or: [{ moderationStatus: { $ne: 'hidden' } }, { donorEmail: req.user.email }] }).sort({ createdAt: -1 })));
router.delete('/donations/:id', auth, async (req, res) => {
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
module.exports = router;
