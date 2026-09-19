const express = require('express');
const router = express.Router();
const PriceHistory = require('../../database/models/PriceHistory');
const auth = require('../middleware/auth');

// @route   GET /api/prices/hotel/:hotelName
router.get('/hotel/:hotelName', async (req, res) => {
    try {
        const priceData = await PriceHistory.findOne({ hotelName: new RegExp(req.params.hotelName, 'i') });
        if (!priceData) return res.status(404).json({ success: false, message: 'No price data found' });
        res.json({ success: true, priceData });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/prices/trends
router.get('/trends', async (req, res) => {
    try {
        const { destination } = req.query;
        const query = destination ? { destination: new RegExp(destination, 'i') } : {};
        const trends = await PriceHistory.find(query).select('hotelName destination currentPrice trend lowestPrice highestPrice');
        res.json({ success: true, count: trends.length, trends });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/prices/alert
router.post('/alert', auth, async (req, res) => {
    try {
        const { hotelName, targetPrice } = req.body;
        const priceData = await PriceHistory.findOne({ hotelName: new RegExp(hotelName, 'i') });
        if (!priceData) return res.status(404).json({ success: false, message: 'Hotel not found' });

        priceData.alerts.push({ userId: req.user._id, targetPrice, isActive: true });
        await priceData.save();

        res.json({ success: true, message: `Alert set! We'll notify you when price drops below ₹${targetPrice}` });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/prices/compare
router.get('/compare', async (req, res) => {
    try {
        const { destination } = req.query;
        if (!destination) return res.status(400).json({ success: false, message: 'Destination required' });
        const hotels = await PriceHistory.find({ destination: new RegExp(destination, 'i') }).sort('currentPrice');
        res.json({ success: true, count: hotels.length, hotels });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
