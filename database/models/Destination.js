const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    state: {
        type: String,
        required: true
    },
    country: {
        type: String,
        default: 'India'
    },
    description: {
        type: String,
        required: true
    },
    images: [String],
    coordinates: {
        lat: Number,
        lng: Number
    },
    attractions: [{
        name: String,
        type: { type: String },
        description: String,
        entryFee: Number,
        timings: String
    }],
    bestSeason: {
        type: String,
        required: true
    },
    climate: String,
    altitude: String,
    category: {
        type: String,
        enum: ['mountain', 'beach', 'desert', 'forest', 'city', 'heritage', 'pilgrimage', 'adventure'],
        required: true
    },
    // Permit & Entry related
    permitRequired: {
        type: Boolean,
        default: false
    },
    permitDetails: {
        permitType: String,
        requiredDocuments: [String],
        processingTime: String,
        fee: Number,
        applicationLink: String,
        restrictions: [String],
        eligibleNationalities: [String]
    },
    // Services available
    services: {
        hotels: [{
            name: String,
            rating: Number,
            pricePerNight: Number,
            hotelType: String,
            amenities: [String]
        }],
        cabs: [{
            cabType: String,
            pricePerKm: Number,
            provider: String
        }],
        adventures: [{
            name: String,
            price: Number,
            duration: String,
            difficulty: String,
            description: String
        }]
    },

    rating: {
        type: Number,
        default: 4.0,
        min: 1,
        max: 5
    },
    popularity: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Destination', destinationSchema);
