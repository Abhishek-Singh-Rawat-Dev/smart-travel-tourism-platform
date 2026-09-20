const mongoose = require('mongoose');
mongoose.set('bufferCommands', false);
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: 50
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6
    },
    role: {
        type: String,
        enum: ['traveller', 'provider', 'admin'],
        default: 'traveller'
    },
    phone: {
        type: String,
        trim: true
    },
    avatar: {
        type: String,
        default: ''
    },
    preferences: {
        interests: [String],
        budget: { type: String, enum: ['budget', 'mid-range', 'luxury'], default: 'mid-range' },
        travelStyle: { type: String, enum: ['solo', 'couple', 'family', 'group'], default: 'solo' }
    },
    // Provider-specific fields
    providerDetails: {
        businessName: String,
        businessType: { type: String, enum: ['hotel', 'cab', 'adventure', ''] },
        address: String,
        verified: { type: Boolean, default: false }
    },
    emergencyContacts: [{
        name: String,
        phone: String,
        relation: String
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    bufferCommands: false
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
