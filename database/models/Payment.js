const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    tax: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true
    },
    method: {
        type: String,
        enum: ['card', 'upi', 'netbanking', 'wallet'],
        default: 'card'
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    receipt: {
        receiptNumber: String,
        generatedAt: Date,
        details: String
    },
    transactionId: String
}, {
    timestamps: true
});

// Generate transaction ID
paymentSchema.pre('save', function(next) {
    if (!this.transactionId) {
        this.transactionId = 'TXN-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    next();
});

module.exports = mongoose.model('Payment', paymentSchema);
