const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../../database/models/User');
const auth = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: 'User already exists with this email' });
        }

        // Create user
        user = new User({ name, email, password, role: role || 'traveller', phone });
        await user.save();

        // Generate JWT
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// @route   POST /api/auth/login
// @desc    Login user & return JWT
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }

        // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }

        // Check if active
        if (!user.isActive) {
            return res.status(403).json({ success: false, message: 'Account is deactivated. Contact admin.' });
        }

        // Generate JWT
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, preferences: user.preferences }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// @route   GET /api/auth/profile
// @desc    Get logged-in user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
router.put('/profile', auth, async (req, res) => {
    try {
        const { name, phone, preferences, emergencyContacts, providerDetails } = req.body;
        const updateData = {};
        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;
        if (preferences) updateData.preferences = preferences;
        if (emergencyContacts) updateData.emergencyContacts = emergencyContacts;
        if (providerDetails) updateData.providerDetails = providerDetails;

        const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true }).select('-password');
        res.json({ success: true, message: 'Profile updated', user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/auth/users (Admin only)
router.get('/users', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }
        const users = await User.find().select('-password').sort('-createdAt');
        res.json({ success: true, count: users.length, users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/auth/users/:id/toggle (Admin)
router.put('/users/:id/toggle', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        user.isActive = !user.isActive;
        await user.save();
        res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
