const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Donation',   // 🔥 FIXED
        required: true
    },
    requesterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    requesterName: {
        type: String,
        required: true,
        trim: true, maxlength: 2000
    },
    reason: {
        type: String,
        required: true,
        trim: true, maxlength: 2000
    },
    status: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Approved', 'Rejected']
    },
    donorEmail: {
        type: String,
        required: true,
        trim: true, maxlength: 2000
    },
    createdAt: {   // 🔥 FIXED
        type: Date,
        default: Date.now
    }
});

RequestSchema.index({ itemId: 1, requesterId: 1 }, { unique: true });
module.exports = mongoose.model('Request', RequestSchema);
