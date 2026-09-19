const mongoose = require('mongoose');

const tripPlanSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    budget: {
        type: Number,
        required: true
    },
    interests: [String],
    travelers: {
        type: Number,
        default: 1
    },
    travelStyle: {
        type: String,
        enum: ['budget', 'mid-range', 'luxury'],
        default: 'mid-range'
    },
    itinerary: [{
        day: Number,
        date: Date,
        activities: [{
            time: String,
            activity: String,
            location: String,
            estimatedCost: Number,
            duration: String,
            category: String,
            notes: String
        }],
        weather: {
            condition: String,
            temperature: Number,
            humidity: Number
        },
        dailyBudget: Number
    }],
    estimatedTotalCost: Number,
    weatherOptimized: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['draft', 'finalized', 'completed'],
        default: 'draft'
    },
    notes: String
}, {
    timestamps: true
});

module.exports = mongoose.model('TripPlan', tripPlanSchema);
