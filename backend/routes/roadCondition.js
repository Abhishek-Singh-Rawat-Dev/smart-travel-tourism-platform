const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const RoadCondition = require('../../database/models/RoadCondition');
const auth = require('../middleware/auth');

function isDbReady() { return mongoose.connection.readyState === 1; }

// @route   POST /api/roads/report
router.post('/report', auth, async (req, res) => {
    try {
        const { location, lat, lng, type, severity, description, affectedRoute } = req.body;

        const report = new RoadCondition({
            reporterId: req.user._id,
            location,
            coordinates: { lat, lng },
            type,
            severity: severity || 'medium',
            description,
            affectedRoute
        });

        await report.save();
        res.status(201).json({ success: true, message: 'Road condition report submitted!', report });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// @route   GET /api/roads/reports
router.get('/reports', async (req, res) => {
    try {
        if (!isDbReady()) return res.json({ success: true, count: 0, reports: [] });
        const { status, type, severity } = req.query;
        const query = {};
        if (status) query.status = status;
        if (type) query.type = type;
        if (severity) query.severity = severity;

        const reports = await RoadCondition.find(query)
            .populate('reporterId', 'name')
            .sort('-createdAt');
        res.json({ success: true, count: reports.length, reports });
    } catch (error) {
        res.json({ success: true, count: 0, reports: [] });
    }
});

// @route   PUT /api/roads/verify/:id (Admin)
router.put('/verify/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const { action, alternateRoute } = req.body; // action: 'verify' or 'reject'
        const report = await RoadCondition.findById(req.params.id);
        if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

        report.status = action === 'verify' ? 'verified' : 'rejected';
        report.verifiedBy = req.user._id;
        report.verifiedAt = new Date();
        if (alternateRoute) report.alternateRoute = alternateRoute;

        await report.save();
        res.json({ success: true, message: `Report ${report.status}!`, report });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/roads/alerts
router.get('/alerts', async (req, res) => {
    try {
        const alerts = await RoadCondition.find({ status: 'verified' })
            .sort('-severity -createdAt')
            .limit(20);
        res.json({ success: true, count: alerts.length, alerts });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/roads/resolve/:id (Admin)
router.put('/resolve/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }
        const report = await RoadCondition.findByIdAndUpdate(req.params.id, { status: 'resolved', resolvedAt: new Date() }, { new: true });
        res.json({ success: true, message: 'Report marked as resolved', report });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
