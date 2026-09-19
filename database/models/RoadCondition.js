const mongoose = require('mongoose');

const roadConditionSchema = new mongoose.Schema({
    reporterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    location: {
        type: String,
        required: true
    },
    coordinates: {
        lat: Number,
        lng: Number
    },
    type: {
        type: String,
        enum: ['blocked', 'landslide', 'waterlogging', 'traffic', 'damaged', 'construction'],
        required: true
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    description: {
        type: String,
        required: true
    },
    photos: [String],
    status: {
        type: String,
        enum: ['pending', 'verified', 'rejected', 'resolved'],
        default: 'pending'
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    verifiedAt: Date,
    resolvedAt: Date,
    affectedRoute: String,
    alternateRoute: String
}, {
    timestamps: true
});

module.exports = mongoose.model('RoadCondition', roadConditionSchema);
