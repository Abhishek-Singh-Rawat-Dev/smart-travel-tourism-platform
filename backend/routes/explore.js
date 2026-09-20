const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Destination = require('../../database/models/Destination');
const { DEMO_DESTINATIONS, DEMO_CATEGORIES } = require('../../database/seeds/seedData');

function isDbReady() {
    return mongoose.connection.readyState === 1;
}

// @route   GET /api/explore/destinations
router.get('/destinations', async (req, res) => {
    try {
        const { category, state, search, page = 1, limit = 12 } = req.query;

        if (isDbReady()) {
            try {
                const query = { isActive: true };
                if (category) query.category = category;
                if (state) query.state = new RegExp(state, 'i');
                if (search) {
                    query.$or = [
                        { name: new RegExp(search, 'i') },
                        { state: new RegExp(search, 'i') },
                        { description: new RegExp(search, 'i') }
                    ];
                }

                const destinations = await Destination.find(query)
                    .select('name state category description rating bestSeason images coordinates popularity permitRequired')
                    .sort('-popularity')
                    .skip((page - 1) * limit)
                    .limit(parseInt(limit));

                const total = await Destination.countDocuments(query);

                return res.json({
                    success: true,
                    count: destinations.length,
                    total,
                    pages: Math.ceil(total / limit),
                    destinations
                });
            } catch (dbErr) {
                console.error('DB error fetching destinations:', dbErr.message);
            }
        }

        // Fallback: demo destinations
        let filtered = [...DEMO_DESTINATIONS];
        if (category) filtered = filtered.filter(d => d.category === category);
        if (state) filtered = filtered.filter(d => d.state.toLowerCase().includes(state.toLowerCase()));
        if (search) {
            const s = search.toLowerCase();
            filtered = filtered.filter(d =>
                d.name.toLowerCase().includes(s) ||
                d.state.toLowerCase().includes(s) ||
                d.description.toLowerCase().includes(s)
            );
        }
        const start = (page - 1) * limit;
        const paged = filtered.slice(start, start + parseInt(limit));
        res.json({ success: true, count: paged.length, total: filtered.length, pages: Math.ceil(filtered.length / limit), destinations: paged });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/explore/popular
router.get('/popular', async (req, res) => {
    try {
        if (isDbReady()) {
            try {
                const destinations = await Destination.find({ isActive: true })
                    .sort('-popularity -rating')
                    .limit(8)
                    .select('name state category description rating bestSeason images coordinates');
                return res.json({ success: true, destinations });
            } catch (dbErr) {
                console.error('DB error fetching popular:', dbErr.message);
            }
        }

        // Fallback
        const popular = [...DEMO_DESTINATIONS].sort((a, b) => b.popularity - a.popularity).slice(0, 8);
        res.json({ success: true, destinations: popular });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/explore/categories
router.get('/categories', async (req, res) => {
    try {
        if (isDbReady()) {
            try {
                const categories = await Destination.distinct('category');
                const categoryData = await Promise.all(categories.map(async cat => ({
                    name: cat,
                    count: await Destination.countDocuments({ category: cat, isActive: true }),
                    icon: { mountain: '🏔️', beach: '🏖️', desert: '🏜️', forest: '🌲', city: '🏙️', heritage: '🏛️', pilgrimage: '🛕', adventure: '🧗' }[cat] || '📍'
                })));
                return res.json({ success: true, categories: categoryData });
            } catch (dbErr) {
                console.error('DB error fetching categories:', dbErr.message);
            }
        }

        // Fallback
        res.json({ success: true, categories: DEMO_CATEGORIES });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/explore/:id
router.get('/:id', async (req, res) => {
    try {
        if (isDbReady()) {
            try {
                const destination = await Destination.findById(req.params.id);
                if (!destination) return res.status(404).json({ success: false, message: 'Destination not found' });
                
                // Increment popularity
                destination.popularity += 1;
                await destination.save();

                return res.json({ success: true, destination });
            } catch (dbErr) {
                console.error('DB error fetching destination:', dbErr.message);
            }
        }

        // Fallback
        const dest = DEMO_DESTINATIONS.find(d => d._id === req.params.id);
        if (dest) return res.json({ success: true, destination: dest });
        res.status(404).json({ success: false, message: 'Destination not found' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
