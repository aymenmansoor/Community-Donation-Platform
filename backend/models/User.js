const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    fullName: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, maxlength: 254, lowercase: true, trim: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    password: { type: String, required: true },
    role: { type: String, enum: ['Donor', 'Requester'], default: 'Donor' }
});

module.exports = mongoose.model('User', UserSchema);
