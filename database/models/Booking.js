const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['hotel', 'cab', 'adventure'],
        required: true
    },
    // Hotel-specific
    hotelName: String,
    roomType: String,
    checkIn: Date,
    checkOut: Date,
    guests: { type: Number, default: 1 },
    
    // Cab-specific
    pickupLocation: String,
    dropLocation: String,
    cabType: { type: String, enum: ['sedan', 'suv', 'hatchback', 'auto', ''] },
    rideDate: Date,
    
    // Adventure-specific
    activityName: String,
    activityType: String,
    slots: { type: Number, default: 1 },
    activityDate: Date,
    
    // Common fields
    destination: String,
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'paid', 'refunded'],
        default: 'unpaid'
    },
    confirmationCode: String,
    providerDetails: {
        providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        providerName: String,
        contact: String
    },
    specialRequests: String
}, {
    timestamps: true
});

// Generate confirmation code before saving
bookingSchema.pre('save', function(next) {
    if (!this.confirmationCode) {
        this.confirmationCode = 'STT-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
    }
    next();
});

module.exports = mongoose.model('Booking', bookingSchema);
