const express = require('express');
const router = express.Router();
const Destination = require('../../database/models/Destination');

// Permit rules database
const permitRules = {
    'Ladakh': {
        required: true,
        type: 'Inner Line Permit (ILP)',
        documents: ['Valid Photo ID (Aadhaar/Passport)', 'Passport-size photos (2)', 'Travel itinerary', 'Hotel booking confirmation'],
        processingTime: '1-2 days',
        fee: 0,
        applicationLink: 'https://lahdclehpermit.in',
        restrictions: ['Foreigners need PAP (Protected Area Permit)', 'Some areas restricted for foreigners', 'Nubra Valley & Pangong Lake need separate permits'],
        eligibleNationalities: ['Indian'],
        foreignerPermit: { type: 'Protected Area Permit (PAP)', fee: 600, processingTime: '2-3 days', minGroupSize: 2 }
    },
    'Sikkim': {
        required: true,
        type: 'Inner Line Permit (ILP) / Restricted Area Permit (RAP)',
        documents: ['Valid Photo ID', 'Passport-size photos (2)', 'Travel itinerary'],
        processingTime: '1 day',
        fee: 0,
        applicationLink: 'https://sikkim.gov.in',
        restrictions: ['North Sikkim needs special permit', 'Tsomgo Lake needs separate permit', 'Nathula Pass restricted for foreigners'],
        eligibleNationalities: ['Indian']
    },
    'Andaman and Nicobar Islands': {
        required: true,
        type: 'Restricted Area Permit (RAP)',
        documents: ['Valid Photo ID / Passport for foreigners', 'Flight/Ship ticket', 'Hotel booking'],
        processingTime: 'On arrival',
        fee: 0,
        restrictions: ['Nicobar Islands closed for tourists', 'Some tribal areas restricted', 'Permit valid for 30 days'],
        eligibleNationalities: ['All']
    },
    'Arunachal Pradesh': {
        required: true,
        type: 'Inner Line Permit (ILP)',
        documents: ['Valid Photo ID', 'Passport-size photos', 'Travel itinerary', 'Recommendation from tour operator'],
        processingTime: '3-5 days',
        fee: 100,
        applicationLink: 'https://arunachalilp.com',
        restrictions: ['Must travel with registered tour operator', 'Minimum 2 persons for foreigners'],
        eligibleNationalities: ['Indian']
    },
    'Lakshadweep': {
        required: true,
        type: 'Entry Permit',
        documents: ['Valid Photo ID', 'Travel booking confirmation', 'COVID vaccination certificate'],
        processingTime: '2-3 days',
        fee: 0,
        restrictions: ['Limited tourist spots', 'Alcohol prohibited', 'Must book through SPORTS (govt agency)'],
        eligibleNationalities: ['Indian']
    }
};

// @route   GET /api/permits/check
router.get('/check', async (req, res) => {
    try {
        const { destination, nationality } = req.query;
        if (!destination) return res.status(400).json({ success: false, message: 'Destination is required' });

        // Check in permit rules
        const rules = permitRules[destination];
        if (rules) {
            return res.json({
                success: true,
                destination,
                permitRequired: true,
                permitInfo: rules,
                nationality: nationality || 'Indian'
            });
        }

        // Check in database
        const dest = await Destination.findOne({ name: new RegExp(destination, 'i') });
        if (dest && dest.permitRequired) {
            return res.json({
                success: true,
                destination: dest.name,
                permitRequired: true,
                permitInfo: dest.permitDetails
            });
        }

        res.json({
            success: true,
            destination,
            permitRequired: false,
            message: 'No special permit required for this destination. Carry a valid photo ID.'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/permits/documents/:destination
router.get('/documents/:destination', (req, res) => {
    const rules = permitRules[req.params.destination];
    if (!rules) {
        return res.json({
            success: true,
            destination: req.params.destination,
            documents: ['Valid Photo ID (Aadhaar/Voter ID/Passport)', 'Travel booking confirmation'],
            message: 'Standard documents needed'
        });
    }
    res.json({ success: true, destination: req.params.destination, documents: rules.documents, permitType: rules.type });
});

// @route   POST /api/permits/verify
router.post('/verify', async (req, res) => {
    try {
        const { destination, documents } = req.body;
        const rules = permitRules[destination];

        if (!rules) {
            return res.json({ success: true, status: 'approved', message: 'No special permit required.' });
        }

        // Simple document verification
        const required = rules.documents;
        const uploaded = documents || [];
        const missing = required.filter(doc => !uploaded.includes(doc));

        if (missing.length === 0) {
            res.json({
                success: true,
                status: 'approved',
                message: 'All documents verified! Your permit application is approved.',
                processingTime: rules.processingTime
            });
        } else {
            res.json({
                success: true,
                status: 'incomplete',
                message: 'Some documents are missing',
                missingDocuments: missing,
                uploadedDocuments: uploaded
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/permits/all-destinations
router.get('/all-destinations', (req, res) => {
    const destinations = Object.entries(permitRules).map(([name, rules]) => ({
        name,
        permitType: rules.type,
        fee: rules.fee,
        processingTime: rules.processingTime
    }));
    res.json({ success: true, count: destinations.length, destinations });
});

module.exports = router;
