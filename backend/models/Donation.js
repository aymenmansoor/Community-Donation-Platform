const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
    itemName: { 
        type: String, 
        required: true,
        trim: true, maxlength: 2000
    },
    category: { 
        type: String, 
        required: true,
        trim: true, maxlength: 2000
    },
    description: { 
        type: String, 
        required: true,
        trim: true, maxlength: 2000
    },
    contact: { 
        type: String, 
        required: true,
        trim: true, maxlength: 2000
    },
    donorEmail: { 
        type: String, 
        required: true,
        trim: true, maxlength: 2000
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
