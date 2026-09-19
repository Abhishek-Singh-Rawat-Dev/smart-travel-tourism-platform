const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// In-memory message store (simulating Bluetooth offline messaging)
let offlineMessages = [];
let connectedPeers = [];

// @route   POST /api/bluetooth/message
router.post('/message', auth, async (req, res) => {
    try {
        const { recipientName, message, type } = req.body;
        
        const msg = {
            id: 'MSG-' + Date.now().toString(36),
            senderId: req.user._id,
            senderName: req.user.name,
            recipientName: recipientName || 'Nearby Travellers',
            message,
            type: type || 'text', // text, sos, location
            timestamp: new Date(),
            synced: false,
            deliveryStatus: 'pending'
        };

        offlineMessages.push(msg);
        res.status(201).json({ success: true, message: 'Message stored for offline delivery', msg });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/bluetooth/pending
router.get('/pending', auth, async (req, res) => {
    try {
        const pending = offlineMessages.filter(m => !m.synced);
        res.json({ success: true, count: pending.length, messages: pending });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/bluetooth/sync
router.put('/sync', auth, async (req, res) => {
    try {
        const { messageIds } = req.body;
        let syncCount = 0;

        offlineMessages = offlineMessages.map(m => {
            if (messageIds && messageIds.includes(m.id)) {
                m.synced = true;
                m.deliveryStatus = 'delivered';
                syncCount++;
            }
            return m;
        });

        res.json({ success: true, message: `${syncCount} messages synced`, syncedCount: syncCount });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/bluetooth/discover
router.get('/discover', auth, (req, res) => {
    // Simulate nearby device discovery
    const nearbyDevices = [
        { deviceId: 'DEV-001', name: 'Traveller_Rahul', distance: '5m', signalStrength: 'Strong' },
        { deviceId: 'DEV-002', name: 'Traveller_Priya', distance: '12m', signalStrength: 'Medium' },
        { deviceId: 'DEV-003', name: 'Traveller_Amit', distance: '25m', signalStrength: 'Weak' },
        { deviceId: 'DEV-004', name: 'Guide_Mohan', distance: '8m', signalStrength: 'Strong' }
    ];

    res.json({
        success: true,
        count: nearbyDevices.length,
        devices: nearbyDevices,
        note: 'Bluetooth discovery simulation. In production, uses Web Bluetooth API.'
    });
});

// @route   POST /api/bluetooth/connect
router.post('/connect', auth, (req, res) => {
    const { deviceId, deviceName } = req.body;
    
    connectedPeers.push({
        userId: req.user._id,
        userName: req.user.name,
        deviceId,
        deviceName,
        connectedAt: new Date()
    });

    res.json({
        success: true,
        message: `Connected to ${deviceName}`,
        connection: { deviceId, deviceName, status: 'connected' }
    });
});

// @route   GET /api/bluetooth/messages
router.get('/messages', auth, (req, res) => {
    const userMessages = offlineMessages.filter(
        m => m.senderId.toString() === req.user._id.toString() || m.recipientName === req.user.name || m.recipientName === 'Nearby Travellers'
    );
    res.json({ success: true, count: userMessages.length, messages: userMessages });
});

module.exports = router;
