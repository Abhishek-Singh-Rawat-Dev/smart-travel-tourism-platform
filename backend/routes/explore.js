const express = require('express');
const router = express.Router();
const Destination = require('../../database/models/Destination');

// @route   GET /api/explore/destinations
router.get('/destinations', async (req, res) => {
    try {
        const { category, state, search, page = 1, limit = 12 } = req.query;
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

        res.json({
            success: true,
            count: destinations.length,
            total,
            pages: Math.ceil(total / limit),
            destinations
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/explore/popular
router.get('/popular', async (req, res) => {
    try {
        const destinations = await Destination.find({ isActive: true })
            .sort('-popularity -rating')
            .limit(8)
            .select('name state category description rating bestSeason images coordinates');
        res.json({ success: true, destinations });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/explore/categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await Destination.distinct('category');
        const categoryData = await Promise.all(categories.map(async cat => ({
            name: cat,
            count: await Destination.countDocuments({ category: cat, isActive: true }),
            icon: { mountain: '🏔️', beach: '🏖️', desert: '🏜️', forest: '🌲', city: '🏙️', heritage: '🏛️', pilgrimage: '🛕', adventure: '🧗' }[cat] || '📍'
        })));
        res.json({ success: true, categories: categoryData });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/explore/:id
router.get('/:id', async (req, res) => {
    try {
        const destination = await Destination.findById(req.params.id);
        if (!destination) return res.status(404).json({ success: false, message: 'Destination not found' });
        
        // Increment popularity
        destination.popularity += 1;
        await destination.save();

        res.json({ success: true, destination });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
