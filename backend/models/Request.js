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
        trim: true
    },
    reason: { 
        type: String,
        required: true,
        trim: true
    },
    status: { 
        type: String, 
        default: 'Pending' // Pending, Approved, Delivered
    },
    donorEmail: { 
        type: String, 
        required: true,
        trim: true
    },
    createdAt: {   // 🔥 FIXED
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Request', RequestSchema);