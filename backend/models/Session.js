const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tokenHash: { type: String, required: true, unique: true },
  csrf: { type: String, required: true },
  expiresAt: { type: Date, required: true, expires: 0 }
});
module.exports = mongoose.model('Session', schema);
