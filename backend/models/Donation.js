const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
    itemName: { 
        type: String, 
        required: true,
        trim: true
    },
    category: { 
        type: String, 
        required: true,
        trim: true
    },
    description: { 
        type: String, 
        required: true,
        trim: true
    },
    contact: { 
        type: String, 
        required: true,
        trim: true
    },
    donorEmail: { 
        type: String, 
        required: true,
        trim: true
    },
    image: { 
        type: String 
    },
    createdAt: {   // 🔥 renamed from "date"
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Donation', DonationSchema);