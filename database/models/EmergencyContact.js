const mongoose = require('mongoose');

const emergencyContactSchema = new mongoose.Schema({
    region: {
        type: String,
        required: true
    },
    state: String,
    coordinates: {
        lat: Number,
        lng: Number
    },
    policeStations: [{
        name: String,
        phone: String,
        address: String,
        coordinates: { lat: Number, lng: Number }
    }],
    hospitals: [{
        name: String,
        phone: String,
        address: String,
        type: { type: String, enum: ['government', 'private'] },
        coordinates: { lat: Number, lng: Number }
    }],
    shelters: [{
        name: String,
        phone: String,
        address: String,
        capacity: Number,
        coordinates: { lat: Number, lng: Number }
    }],
    emergencyNumbers: {
        police: { type: String, default: '100' },
        ambulance: { type: String, default: '108' },
        fire: { type: String, default: '101' },
        disaster: { type: String, default: '1078' },
        women: { type: String, default: '1091' },
        tourist: { type: String, default: '1363' }
    },
    safetyTips: [String],
    sosAlerts: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        location: { lat: Number, lng: Number },
        message: String,
        status: { type: String, enum: ['active', 'responded', 'resolved'], default: 'active' },
        createdAt: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('EmergencyContact', emergencyContactSchema);
