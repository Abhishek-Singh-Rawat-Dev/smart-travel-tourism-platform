const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const TripPlan = require('../../database/models/TripPlan');
const Destination = require('../../database/models/Destination');
const auth = require('../middleware/auth');

function isDbReady() { return mongoose.connection.readyState === 1; }

// Activity templates by interest
const activityTemplates = {
    adventure: [
        { activity: 'Trekking', duration: '3-4 hrs', category: 'adventure' },
        { activity: 'River Rafting', duration: '2 hrs', category: 'adventure' },
        { activity: 'Paragliding', duration: '1 hr', category: 'adventure' },
        { activity: 'Rock Climbing', duration: '2 hrs', category: 'adventure' },
        { activity: 'Zip-lining', duration: '1 hr', category: 'adventure' },
        { activity: 'Mountain Biking', duration: '3 hrs', category: 'adventure' }
    ],
    culture: [
        { activity: 'Visit Local Temple', duration: '1-2 hrs', category: 'culture' },
        { activity: 'Heritage Walk', duration: '2-3 hrs', category: 'culture' },
        { activity: 'Museum Visit', duration: '2 hrs', category: 'culture' },
        { activity: 'Local Art Workshop', duration: '2 hrs', category: 'culture' },
        { activity: 'Traditional Dance Show', duration: '1.5 hrs', category: 'culture' }
    ],
    nature: [
        { activity: 'Nature Walk', duration: '2 hrs', category: 'nature' },
        { activity: 'Bird Watching', duration: '2-3 hrs', category: 'nature' },
        { activity: 'Sunrise Point Visit', duration: '1.5 hrs', category: 'nature' },
        { activity: 'Waterfall Excursion', duration: '3 hrs', category: 'nature' },
        { activity: 'Garden Tour', duration: '1.5 hrs', category: 'nature' }
    ],
    food: [
        { activity: 'Street Food Tour', duration: '2 hrs', category: 'food' },
        { activity: 'Cooking Class', duration: '3 hrs', category: 'food' },
        { activity: 'Fine Dining Experience', duration: '2 hrs', category: 'food' },
        { activity: 'Local Market Visit', duration: '1.5 hrs', category: 'food' },
        { activity: 'Tea/Coffee Plantation Tour', duration: '2 hrs', category: 'food' }
    ],
    relaxation: [
        { activity: 'Spa & Wellness', duration: '2 hrs', category: 'relaxation' },
        { activity: 'Yoga Session', duration: '1.5 hrs', category: 'relaxation' },
        { activity: 'Lake/Beach Relaxation', duration: '3 hrs', category: 'relaxation' },
        { activity: 'Meditation', duration: '1 hr', category: 'relaxation' },
        { activity: 'Resort Pool Time', duration: '2 hrs', category: 'relaxation' }
    ],
    shopping: [
        { activity: 'Local Handicraft Shopping', duration: '2 hrs', category: 'shopping' },
        { activity: 'Souvenir Market', duration: '1.5 hrs', category: 'shopping' },
        { activity: 'Mall Visit', duration: '2 hrs', category: 'shopping' }
    ]
};

// Budget multipliers
const budgetMultipliers = { 'budget': 0.6, 'mid-range': 1, 'luxury': 1.8 };

// Generate itinerary using rule-based AI
function generateItinerary(destination, startDate, endDate, budget, interests, travelers, travelStyle) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const dailyBudget = budget / days;
    const multiplier = budgetMultipliers[travelStyle] || 1;
    const itinerary = [];

    // Collect activities based on interests
    let allActivities = [];
    const userInterests = interests.length > 0 ? interests : ['nature', 'culture', 'food'];
    userInterests.forEach(interest => {
        if (activityTemplates[interest]) {
            allActivities = allActivities.concat(activityTemplates[interest]);
        }
    });

    // Add default activities
    allActivities.push(
        { activity: 'Check-in & Rest', duration: '1 hr', category: 'travel' },
        { activity: 'Local Sightseeing', duration: '2-3 hrs', category: 'sightseeing' },
        { activity: 'Photography Walk', duration: '1.5 hrs', category: 'leisure' }
    );

    const timeSlots = ['07:00 AM', '09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM', '05:00 PM', '07:00 PM'];

    for (let d = 0; d < days; d++) {
        const dayDate = new Date(start);
        dayDate.setDate(dayDate.getDate() + d);
        
        const dayActivities = [];
        const activitiesPerDay = Math.min(5, Math.max(3, Math.floor(Math.random() * 3) + 3));

        // First day: arrival activities
        if (d === 0) {
            dayActivities.push({
                time: '10:00 AM',
                activity: `Arrive at ${destination}`,
                location: `${destination} Station/Airport`,
                estimatedCost: 0,
                duration: '1 hr',
                category: 'travel',
                notes: 'Check-in to accommodation'
            });
            dayActivities.push({
                time: '12:00 PM',
                activity: 'Hotel Check-in & Fresh Up',
                location: 'Hotel',
                estimatedCost: Math.round(dailyBudget * 0.4 * multiplier),
                duration: '1.5 hrs',
                category: 'accommodation',
                notes: 'Settle in and prepare for exploration'
            });
        }

        // Last day: departure activities
        if (d === days - 1) {
            dayActivities.push({
                time: '10:00 AM',
                activity: 'Souvenir Shopping',
                location: `${destination} Market`,
                estimatedCost: Math.round(dailyBudget * 0.15 * multiplier),
                duration: '2 hrs',
                category: 'shopping',
                notes: 'Buy local souvenirs and gifts'
            });
            dayActivities.push({
                time: '02:00 PM',
                activity: 'Hotel Checkout & Departure',
                location: `${destination}`,
                estimatedCost: 0,
                duration: '2 hrs',
                category: 'travel',
                notes: 'Head back home with memories!'
            });
        }

        // Fill remaining slots with activities
        const remaining = activitiesPerDay - dayActivities.length;
        const shuffled = [...allActivities].sort(() => Math.random() - 0.5);
        for (let i = 0; i < remaining && i < shuffled.length; i++) {
            const act = shuffled[i];
            dayActivities.push({
                time: timeSlots[(dayActivities.length) % timeSlots.length],
                activity: act.activity,
                location: `${destination}`,
                estimatedCost: Math.round((dailyBudget * 0.12 + Math.random() * dailyBudget * 0.08) * multiplier),
                duration: act.duration,
                category: act.category,
                notes: ''
            });
        }

        // Sort by time
        dayActivities.sort((a, b) => {
            const tA = new Date('2000-01-01 ' + a.time);
            const tB = new Date('2000-01-01 ' + b.time);
            return tA - tB;
        });

        itinerary.push({
            day: d + 1,
            date: dayDate,
            activities: dayActivities,
            weather: {
                condition: ['Sunny', 'Partly Cloudy', 'Clear', 'Cloudy'][Math.floor(Math.random() * 4)],
                temperature: Math.floor(Math.random() * 15) + 18,
                humidity: Math.floor(Math.random() * 30) + 40
            },
            dailyBudget: Math.round(dailyBudget)
        });
    }

    return itinerary;
}

// @route   POST /api/trips/plan
// @desc    Generate AI trip plan
router.post('/plan', auth, async (req, res) => {
    try {
        const { destination, startDate, endDate, budget, interests, travelers, travelStyle } = req.body;

        if (!destination || !startDate || !endDate || !budget) {
            return res.status(400).json({ success: false, message: 'Destination, dates, and budget are required' });
        }

        const itinerary = generateItinerary(destination, startDate, endDate, budget, interests || [], travelers || 1, travelStyle || 'mid-range');

        const estimatedTotalCost = itinerary.reduce((sum, day) => {
            return sum + day.activities.reduce((dSum, act) => dSum + act.estimatedCost, 0);
        }, 0);

        const tripPlan = new TripPlan({
            userId: req.user._id,
            destination,
            startDate,
            endDate,
            budget,
            interests: interests || [],
            travelers: travelers || 1,
            travelStyle: travelStyle || 'mid-range',
            itinerary,
            estimatedTotalCost
        });

        await tripPlan.save();
        res.status(201).json({ success: true, message: 'Trip plan generated!', tripPlan });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// @route   GET /api/trips/my-trips
router.get('/my-trips', auth, async (req, res) => {
    try {
        if (!isDbReady()) return res.json({ success: true, count: 0, trips: [] });
        const trips = await TripPlan.find({ userId: req.user._id }).sort('-createdAt');
        res.json({ success: true, count: trips.length, trips });
    } catch (error) {
        res.json({ success: true, count: 0, trips: [] });
    }
});

// @route   GET /api/trips/:id
router.get('/:id', auth, async (req, res) => {
    try {
        const trip = await TripPlan.findById(req.params.id);
        if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
        res.json({ success: true, trip });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/trips/:id/optimize
router.put('/:id/optimize', auth, async (req, res) => {
    try {
        const trip = await TripPlan.findById(req.params.id);
        if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

        // Re-optimize: swap outdoor activities on bad weather days
        trip.itinerary.forEach(day => {
            if (day.weather.condition === 'Rainy' || day.weather.condition === 'Stormy') {
                day.activities = day.activities.map(act => {
                    if (['adventure', 'nature'].includes(act.category)) {
                        act.activity = 'Indoor Activity: ' + ['Museum Visit', 'Local Cafe Experience', 'Shopping', 'Spa Treatment'][Math.floor(Math.random() * 4)];
                        act.notes = 'Swapped due to weather forecast';
                    }
                    return act;
                });
            }
        });

        trip.weatherOptimized = true;
        await trip.save();
        res.json({ success: true, message: 'Trip optimized for weather!', trip });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/trips/:id
router.delete('/:id', auth, async (req, res) => {
    try {
        await TripPlan.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Trip deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
