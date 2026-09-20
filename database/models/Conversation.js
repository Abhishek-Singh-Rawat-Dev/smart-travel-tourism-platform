const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.Mixed, // Supports both ObjectId and demo string IDs
        required: true
    }],
    lastMessage: {
        type: String,
        default: ''
    },
    lastMessageAt: {
        type: Date,
        default: Date.now
    },
    // Store participant info for quick rendering without populate
    participantDetails: [{
        userId: mongoose.Schema.Types.Mixed,
        name: String,
        role: String
    }]
}, {
    timestamps: true
});

// Index for fast lookup by participant
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
