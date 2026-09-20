const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.Mixed, // ObjectId or demo string ID
        required: true
    },
    senderName: {
        type: String,
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    text: {
        type: String,
        required: [true, 'Message text is required'],
        trim: true,
        maxlength: 2000
    },
    read: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for fetching messages in a conversation chronologically
messageSchema.index({ conversationId: 1, createdAt: 1 });
// Index for unread count
messageSchema.index({ receiver: 1, read: 1 });

module.exports = mongoose.model('Message', messageSchema);
