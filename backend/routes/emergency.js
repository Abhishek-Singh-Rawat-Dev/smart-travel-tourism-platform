const express = require('express');
const router = express.Router();
const EmergencyContact = require('../../database/models/EmergencyContact');
const auth = require('../middleware/auth');

// @route   POST /api/emergency/sos
router.post('/sos', auth, async (req, res) => {
    try {
        const { lat, lng, message } = req.body;

        // Find nearest region
        let region = await EmergencyContact.findOne();
        if (!region) {
            // Create default
            region = new EmergencyContact({
                region: 'Default',
                state: 'All India',
                emergencyNumbers: { police: '100', ambulance: '108', fire: '101', disaster: '1078', women: '1091', tourist: '1363' }
            });
            await region.save();
        }

        // Add SOS alert
        region.sosAlerts.push({
            userId: req.user._id,
            location: { lat, lng },
            message: message || 'Emergency! Need help!',
            status: 'active'
        });
        await region.save();

        res.json({
            success: true,
            message: '🚨 SOS Alert Sent! Help is on the way!',
            emergencyNumbers: region.emergencyNumbers,
            sosId: region.sosAlerts[region.sosAlerts.length - 1]._id,
            nearestServices: {
                police: region.policeStations.slice(0, 2),
                hospital: region.hospitals.slice(0, 2),
                shelter: region.shelters.slice(0, 2)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// @route   GET /api/emergency/nearest
router.get('/nearest', async (req, res) => {
    try {
        const { lat, lng } = req.query;
        const regions = await EmergencyContact.find();
        
        // Get all nearby services
        let allPolice = [], allHospitals = [], allShelters = [];
        regions.forEach(r => {
            allPolice = allPolice.concat(r.policeStations);
            allHospitals = allHospitals.concat(r.hospitals);
            allShelters = allShelters.concat(r.shelters);
        });

        res.json({
            success: true,
            nearest: {
                policeStations: allPolice.slice(0, 5),
                hospitals: allHospitals.slice(0, 5),
                shelters: allShelters.slice(0, 3)
            },
            emergencyNumbers: {
                police: '100',
                ambulance: '108',
                fire: '101',
                disaster: '1078',
                women: '1091',
                tourist: '1363'
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/emergency/safety-tips
router.get('/safety-tips', (req, res) => {
    const tips = [
        { category: 'General', tips: ['Always carry a valid ID', 'Keep emergency contacts saved', 'Share your live location with family', 'Keep offline maps downloaded'] },
        { category: 'Mountain Travel', tips: ['Carry altitude sickness medicine', 'Don\'t trek alone', 'Check weather before starting', 'Carry warm clothes even in summer'] },
        { category: 'Beach Travel', tips: ['Follow lifeguard instructions', 'Don\'t swim after sunset', 'Avoid going to secluded areas alone', 'Stay hydrated'] },
        { category: 'Night Travel', tips: ['Travel in groups', 'Keep your phone charged', 'Inform someone about your route', 'Use registered taxis only'] },
        { category: 'Health', tips: ['Carry a first aid kit', 'Stay hydrated', 'Eat at hygienic places', 'Carry prescribed medicines'] }
    ];
    res.json({ success: true, safetyTips: tips });
});

// @route   GET /api/emergency/sos-alerts (Admin)
router.get('/sos-alerts', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }
        const regions = await EmergencyContact.find().populate('sosAlerts.userId', 'name email phone');
        const allAlerts = [];
        regions.forEach(r => {
            r.sosAlerts.forEach(alert => {
                allAlerts.push({ ...alert.toObject(), region: r.region });
            });
        });
        allAlerts.sort((a, b) => b.createdAt - a.createdAt);
        res.json({ success: true, count: allAlerts.length, alerts: allAlerts });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
