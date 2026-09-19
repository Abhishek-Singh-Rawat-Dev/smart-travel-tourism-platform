const express = require('express');
const router = express.Router();

// @route   GET /api/navigation/route
router.get('/route', async (req, res) => {
    try {
        const { fromLat, fromLng, toLat, toLng } = req.query;

        if (!fromLat || !fromLng || !toLat || !toLng) {
            return res.status(400).json({ success: false, message: 'Start and end coordinates required' });
        }

        // Calculate distance using Haversine formula
        const R = 6371; // Earth radius in km
        const dLat = (toLat - fromLat) * Math.PI / 180;
        const dLng = (toLng - fromLng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(fromLat * Math.PI / 180) * Math.cos(toLat * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        // Estimate time (avg speed 40 km/h for Indian roads)
        const timeHours = distance / 40;
        const hours = Math.floor(timeHours);
        const minutes = Math.round((timeHours - hours) * 60);

        // Generate waypoints for route visualization
        const steps = 10;
        const waypoints = [];
        for (let i = 0; i <= steps; i++) {
            const fraction = i / steps;
            waypoints.push({
                lat: parseFloat(fromLat) + (parseFloat(toLat) - parseFloat(fromLat)) * fraction + (Math.random() * 0.01 - 0.005),
                lng: parseFloat(fromLng) + (parseFloat(toLng) - parseFloat(fromLng)) * fraction + (Math.random() * 0.01 - 0.005)
            });
        }

        res.json({
            success: true,
            route: {
                distance: `${distance.toFixed(1)} km`,
                duration: `${hours}h ${minutes}m`,
                waypoints,
                fuelEstimate: `₹${Math.round(distance * 8)}`,
                tollEstimate: distance > 100 ? `₹${Math.round(distance * 1.5)}` : '₹0',
                roadCondition: ['Good', 'Moderate', 'Under Construction'][Math.floor(Math.random() * 3)]
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/navigation/directions
router.get('/directions', async (req, res) => {
    try {
        const { from, to } = req.query;
        const directions = [
            { step: 1, instruction: `Start from ${from || 'your location'}`, distance: '0 km' },
            { step: 2, instruction: 'Head north on NH-3', distance: '2.5 km' },
            { step: 3, instruction: 'Turn right at the main crossing', distance: '5.0 km' },
            { step: 4, instruction: 'Continue on the highway', distance: '15.0 km' },
            { step: 5, instruction: 'Take slight left towards mountains', distance: '25.0 km' },
            { step: 6, instruction: 'Cross the bridge', distance: '30.0 km' },
            { step: 7, instruction: `Arrive at ${to || 'destination'}`, distance: '35.0 km' }
        ];

        res.json({ success: true, directions, totalSteps: directions.length });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/navigation/popular-routes
router.get('/popular-routes', (req, res) => {
    const routes = [
        { from: 'Delhi', to: 'Manali', distance: '530 km', duration: '12h 30m', scenic: true },
        { from: 'Delhi', to: 'Jaipur', distance: '280 km', duration: '5h 30m', scenic: false },
        { from: 'Mumbai', to: 'Goa', distance: '590 km', duration: '10h', scenic: true },
        { from: 'Bangalore', to: 'Ooty', distance: '270 km', duration: '6h', scenic: true },
        { from: 'Delhi', to: 'Rishikesh', distance: '240 km', duration: '5h 30m', scenic: true },
        { from: 'Chandigarh', to: 'Shimla', distance: '115 km', duration: '3h 30m', scenic: true },
        { from: 'Kolkata', to: 'Darjeeling', distance: '615 km', duration: '12h', scenic: true },
        { from: 'Chennai', to: 'Pondicherry', distance: '150 km', duration: '3h', scenic: true }
    ];
    res.json({ success: true, routes });
});

module.exports = router;
