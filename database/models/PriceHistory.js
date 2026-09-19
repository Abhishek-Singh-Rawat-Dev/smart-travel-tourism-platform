const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema({
    hotelName: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    roomType: {
        type: String,
        default: 'standard'
    },
    prices: [{
        date: { type: Date, required: true },
        price: { type: Number, required: true },
        source: { type: String, default: 'platform' }
    }],
    currentPrice: {
        type: Number,
        required: true
    },
    lowestPrice: Number,
    highestPrice: Number,
    trend: {
        type: String,
        enum: ['rising', 'falling', 'stable'],
        default: 'stable'
    },
    alerts: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        targetPrice: Number,
        isActive: { type: Boolean, default: true }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('PriceHistory', priceHistorySchema);
