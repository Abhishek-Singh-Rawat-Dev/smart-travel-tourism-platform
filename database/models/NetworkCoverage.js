const mongoose = require('mongoose');

const networkCoverageSchema = new mongoose.Schema({
    location: {
        type: String,
        required: true
    },
    coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    operator: {
        type: String,
        required: true
    },
    signalStrength: {
        type: Number,
        min: 0,
        max: 100
    },
    coverageType: {
        type: String,
        enum: ['2G', '3G', '4G', '5G', 'none'],
        default: 'none'
    },
    isDeadZone: {
        type: Boolean,
        default: false
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('NetworkCoverage', networkCoverageSchema);
