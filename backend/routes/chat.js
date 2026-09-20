const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Conversation = require('../../database/models/Conversation');
const Message = require('../../database/models/Message');
const User = require('../../database/models/User');
const auth = require('../middleware/auth');
const { DEMO_USERS } = require('../../database/seeds/seedData');

function isDbReady() { return mongoose.connection.readyState === 1; }

// @route   GET /api/chat/conversations
// @desc    Get all conversations for the logged-in user
router.get('/conversations', auth, async (req, res) => {
    try {
        if (!isDbReady()) return res.json({ success: true, conversations: [] });

        const userId = req.user._id.toString();
        const conversations = await Conversation.find({
            participants: userId
        }).sort('-lastMessageAt');

        // Attach unread counts for each conversation
        const withUnread = await Promise.all(conversations.map(async (conv) => {
            const unreadCount = await Message.countDocuments({
                conversationId: conv._id,
                receiver: userId,
                read: false
            });
            return { ...conv.toObject(), unreadCount };
        }));

        res.json({ success: true, conversations: withUnread });
    } catch (error) {
        console.error('Chat conversations error:', error.message);
        res.json({ success: true, conversations: [] });
    }
});

// @route   GET /api/chat/conversations/:id/messages
// @desc    Get messages in a conversation (paginated)
router.get('/conversations/:id/messages', auth, async (req, res) => {
    try {
        if (!isDbReady()) return res.json({ success: true, messages: [] });

        const { page = 1, limit = 50 } = req.query;
        const messages = await Message.find({ conversationId: req.params.id })
            .sort('createdAt')
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({ success: true, count: messages.length, messages });
    } catch (error) {
        console.error('Chat messages error:', error.message);
        res.json({ success: true, messages: [] });
    }
});

// @route   POST /api/chat/send
// @desc    Send a message (creates conversation if first message)
router.post('/send', auth, async (req, res) => {
    try {
        if (!isDbReady()) {
            return res.status(503).json({ success: false, message: 'Database unavailable. Chat requires a connected database.' });
        }

        const { receiverId, text } = req.body;
        if (!receiverId || !text || !text.trim()) {
            return res.status(400).json({ success: false, message: 'Receiver and message text are required' });
        }

        const senderId = req.user._id.toString();
        const senderName = req.user.name;

        // Get receiver info
        let receiverName = 'User';
        let receiverRole = 'traveller';
        try {
            const receiverUser = await User.findById(receiverId).select('name role');
            if (receiverUser) {
                receiverName = receiverUser.name;
                receiverRole = receiverUser.role;
            }
        } catch (e) {
            // Fallback to demo users
            const demoReceiver = DEMO_USERS.find(u => u._id === receiverId);
            if (demoReceiver) {
                receiverName = demoReceiver.name;
                receiverRole = demoReceiver.role;
            }
        }

        // Find or create conversation
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        });

        if (!conversation) {
            conversation = new Conversation({
                participants: [senderId, receiverId],
                participantDetails: [
                    { userId: senderId, name: senderName, role: req.user.role || 'traveller' },
                    { userId: receiverId, name: receiverName, role: receiverRole }
                ],
                lastMessage: text.trim(),
                lastMessageAt: new Date()
            });
            await conversation.save();
        } else {
            conversation.lastMessage = text.trim();
            conversation.lastMessageAt = new Date();
            await conversation.save();
        }

        // Create message
        const message = new Message({
            conversationId: conversation._id,
            sender: senderId,
            senderName: senderName,
            receiver: receiverId,
            text: text.trim()
        });
        await message.save();

        res.status(201).json({
            success: true,
            message: 'Message sent!',
            data: message,
            conversationId: conversation._id
        });
    } catch (error) {
        console.error('Send message error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to send message', error: error.message });
    }
});

// @route   PUT /api/chat/read/:conversationId
// @desc    Mark all messages in a conversation as read
router.put('/read/:conversationId', auth, async (req, res) => {
    try {
        if (!isDbReady()) return res.json({ success: true, message: 'OK' });

        const userId = req.user._id.toString();
        await Message.updateMany(
            { conversationId: req.params.conversationId, receiver: userId, read: false },
            { read: true, readAt: new Date() }
        );

        res.json({ success: true, message: 'Messages marked as read' });
    } catch (error) {
        res.json({ success: true, message: 'OK' });
    }
});

// @route   GET /api/chat/users
// @desc    Search users to start a new chat
//          Travellers see providers; Providers see travellers; Admin sees all
router.get('/users', auth, async (req, res) => {
    try {
        const { search = '' } = req.query;
        const currentRole = req.user.role;
        const currentId = req.user._id.toString();

        if (isDbReady()) {
            try {
                const query = { _id: { $ne: currentId }, isActive: true };

                // Role-based filtering
                if (currentRole === 'traveller') {
                    query.role = { $in: ['provider', 'admin'] };
                } else if (currentRole === 'provider') {
                    query.role = { $in: ['traveller', 'admin'] };
                }
                // Admin sees everyone

                if (search) {
                    query.$or = [
                        { name: new RegExp(search, 'i') },
                        { email: new RegExp(search, 'i') }
                    ];
                }

                const users = await User.find(query)
                    .select('name email role phone providerDetails.businessName')
                    .limit(20)
                    .sort('name');

                return res.json({ success: true, users });
            } catch (dbErr) {
                console.error('DB error fetching chat users:', dbErr.message);
            }
        }

        // Fallback: demo users
        let filtered = DEMO_USERS.filter(u => u._id !== currentId);
        if (currentRole === 'traveller') filtered = filtered.filter(u => u.role === 'provider' || u.role === 'admin');
        else if (currentRole === 'provider') filtered = filtered.filter(u => u.role === 'traveller' || u.role === 'admin');
        if (search) {
            const s = search.toLowerCase();
            filtered = filtered.filter(u => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s));
        }

        const safeUsers = filtered.map(u => ({
            _id: u._id, name: u.name, email: u.email, role: u.role, phone: u.phone
        }));
        res.json({ success: true, users: safeUsers });
    } catch (error) {
        res.json({ success: true, users: [] });
    }
});

// @route   GET /api/chat/unread-count
// @desc    Get total unread message count for badge
router.get('/unread-count', auth, async (req, res) => {
    try {
        if (!isDbReady()) return res.json({ success: true, count: 0 });

        const userId = req.user._id.toString();
        const count = await Message.countDocuments({ receiver: userId, read: false });
        res.json({ success: true, count });
    } catch (error) {
        res.json({ success: true, count: 0 });
    }
});

module.exports = router;
