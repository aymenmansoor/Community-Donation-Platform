const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  action: { type: String, required: true, maxlength: 80 },
  target: { type: String, maxlength: 100, default: '' },
  outcome: { type: String, enum: ['success', 'denied'], default: 'success' },
  createdAt: { type: Date, default: Date.now, expires: 90 * 86400 }
});
module.exports = mongoose.model('AuditEvent', schema);
