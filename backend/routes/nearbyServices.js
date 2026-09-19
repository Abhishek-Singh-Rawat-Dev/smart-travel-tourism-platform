const express = require('express');
const router = express.Router();

// Simulated nearby places data (in production, use OpenStreetMap Overpass API)
const nearbyPlacesDB = {
    restaurant: [
        { name: 'Mountain View Restaurant', type: 'restaurant', rating: 4.3, distance: '0.5 km', cuisine: 'North Indian', priceRange: '₹₹' },
        { name: 'Himalayan Kitchen', type: 'restaurant', rating: 4.5, distance: '0.8 km', cuisine: 'Tibetan', priceRange: '₹₹' },
        { name: 'Cafe Sunrise', type: 'restaurant', rating: 4.1, distance: '1.2 km', cuisine: 'Continental', priceRange: '₹₹₹' },
        { name: 'Dhaba Express', type: 'restaurant', rating: 4.0, distance: '0.3 km', cuisine: 'Punjabi', priceRange: '₹' },
        { name: 'Pizza Point', type: 'restaurant', rating: 3.8, distance: '1.5 km', cuisine: 'Italian', priceRange: '₹₹' }
    ],
    hospital: [
        { name: 'Civil Hospital', type: 'hospital', rating: 3.5, distance: '2.1 km', phone: '01902-252211', emergency: true },
        { name: 'Lady Willingdon Hospital', type: 'hospital', rating: 4.0, distance: '1.8 km', phone: '01902-252222', emergency: true },
        { name: 'Shri Lal Bahadur Clinic', type: 'hospital', rating: 3.8, distance: '3.2 km', phone: '01902-253333', emergency: false }
    ],
    atm: [
        { name: 'SBI ATM', type: 'atm', distance: '0.3 km', bank: 'State Bank of India' },
        { name: 'HDFC ATM', type: 'atm', distance: '0.7 km', bank: 'HDFC Bank' },
        { name: 'ICICI ATM', type: 'atm', distance: '1.1 km', bank: 'ICICI Bank' },
        { name: 'PNB ATM', type: 'atm', distance: '0.9 km', bank: 'Punjab National Bank' }
    ],
    police: [
        { name: 'Manali Police Station', type: 'police', distance: '1.5 km', phone: '01902-252340' },
        { name: 'Tourist Police Booth', type: 'police', distance: '0.8 km', phone: '1363' }
    ],
    pharmacy: [
        { name: 'Lifeline Pharmacy', type: 'pharmacy', distance: '0.4 km', open24h: true },
        { name: 'Apollo Pharmacy', type: 'pharmacy', distance: '1.0 km', open24h: false },
        { name: 'Jan Aushadhi', type: 'pharmacy', distance: '1.3 km', open24h: false }
    ],
    petrolpump: [
        { name: 'Indian Oil Petrol Pump', type: 'petrolpump', distance: '2.5 km', brand: 'IOCL' },
        { name: 'HP Petrol Pump', type: 'petrolpump', distance: '3.1 km', brand: 'HPCL' }
    ]
};

// @route   GET /api/nearby
router.get('/', async (req, res) => {
    try {
        const { lat, lng, type } = req.query;

        if (type && nearbyPlacesDB[type]) {
            const places = nearbyPlacesDB[type].map(place => ({
                ...place,
                coordinates: {
                    lat: parseFloat(lat || 32.2396) + (Math.random() * 0.02 - 0.01),
                    lng: parseFloat(lng || 77.1887) + (Math.random() * 0.02 - 0.01)
                }
            }));
            return res.json({ success: true, count: places.length, places });
        }

        // Return all types
        const allPlaces = {};
        Object.keys(nearbyPlacesDB).forEach(key => {
            allPlaces[key] = nearbyPlacesDB[key].map(place => ({
                ...place,
                coordinates: {
                    lat: parseFloat(lat || 32.2396) + (Math.random() * 0.02 - 0.01),
                    lng: parseFloat(lng || 77.1887) + (Math.random() * 0.02 - 0.01)
                }
            }));
        });

        res.json({ success: true, places: allPlaces });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/nearby/types
router.get('/types', (req, res) => {
    res.json({
        success: true,
        types: Object.keys(nearbyPlacesDB).map(key => ({
            key,
            label: key.charAt(0).toUpperCase() + key.slice(1),
            count: nearbyPlacesDB[key].length
        }))
    });
});

module.exports = router;
