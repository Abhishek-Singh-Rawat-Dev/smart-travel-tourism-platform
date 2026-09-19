const express = require('express');
const router = express.Router();
const NetworkCoverage = require('../../database/models/NetworkCoverage');
const auth = require('../middleware/auth');

// @route   GET /api/network/coverage
router.get('/coverage', async (req, res) => {
    try {
        const { lat, lng, radius } = req.query;
        const coverageData = await NetworkCoverage.find();
        
        // If no data, return simulated coverage
        if (coverageData.length === 0) {
            const operators = ['Jio', 'Airtel', 'Vi', 'BSNL'];
            const simulated = operators.map(op => ({
                operator: op,
                coverageType: ['4G', '4G', '3G', '2G'][operators.indexOf(op)],
                signalStrength: Math.floor(Math.random() * 40) + 60,
                isDeadZone: false
            }));
            return res.json({ success: true, location: { lat, lng }, coverage: simulated });
        }

        res.json({ success: true, count: coverageData.length, coverage: coverageData });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/network/deadzones
router.get('/deadzones', async (req, res) => {
    try {
        const deadzones = await NetworkCoverage.find({ isDeadZone: true });
        
        // Return simulated dead zones if no data
        if (deadzones.length === 0) {
            const simulated = [
                { location: 'Rohtang Pass', coordinates: { lat: 32.3716, lng: 77.2481 }, operator: 'All', coverageType: 'none', signalStrength: 0 },
                { location: 'Spiti Valley', coordinates: { lat: 32.2464, lng: 78.0338 }, operator: 'All', coverageType: 'none', signalStrength: 5 },
                { location: 'Zanskar Valley', coordinates: { lat: 33.5000, lng: 77.0000 }, operator: 'All', coverageType: 'none', signalStrength: 0 },
                { location: 'Chandratal Lake', coordinates: { lat: 32.4833, lng: 77.6167 }, operator: 'All', coverageType: 'none', signalStrength: 0 },
                { location: 'Valley of Flowers', coordinates: { lat: 30.7280, lng: 79.6053 }, operator: 'Partial', coverageType: '2G', signalStrength: 15 },
                { location: 'Gurez Valley', coordinates: { lat: 34.6333, lng: 74.8333 }, operator: 'BSNL only', coverageType: '2G', signalStrength: 20 },
                { location: 'Dhankar Lake', coordinates: { lat: 32.0944, lng: 78.3178 }, operator: 'All', coverageType: 'none', signalStrength: 0 },
                { location: 'Pin Valley', coordinates: { lat: 32.0833, lng: 78.0333 }, operator: 'All', coverageType: 'none', signalStrength: 10 }
            ];
            return res.json({ success: true, count: simulated.length, deadzones: simulated });
        }

        res.json({ success: true, count: deadzones.length, deadzones });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/network/report
router.post('/report', auth, async (req, res) => {
    try {
        const { location, lat, lng, operator, signalStrength, coverageType } = req.body;
        
        const report = new NetworkCoverage({
            location,
            coordinates: { lat, lng },
            operator,
            signalStrength: signalStrength || 0,
            coverageType: coverageType || 'none',
            isDeadZone: signalStrength < 10,
            reportedBy: req.user._id
        });

        await report.save();
        res.status(201).json({ success: true, message: 'Coverage report submitted!', report });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

module.exports = router;
