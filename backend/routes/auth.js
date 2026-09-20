const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../../database/models/User');
const auth = require('../middleware/auth');
const { DEMO_USERS } = require('../../database/seeds/seedData');

const JWT_SECRET = process.env.JWT_SECRET || 'smartTravelTourism2024SecretKey_x7k9m2p';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

// Helper: check if DB is actually connected and ready for queries
function isDbReady() {
    return mongoose.connection.readyState === 1;
}

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;

        if (!isDbReady()) {
            return res.status(503).json({ success: false, message: 'Database is currently unavailable. Please try again later or contact admin to configure MongoDB Atlas.' });
        }

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: 'User already exists with this email' });
        }

        // Create user
        user = new User({ name, email, password, role: role || 'traveller', phone });
        await user.save();

        // Generate JWT
        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRE });

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

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        // --- Try MongoDB first ---
        if (isDbReady()) {
            try {
                const user = await User.findOne({ email }).setOptions({ bufferCommands: false });

                if (user) {
                    const isMatch = await user.comparePassword(password);
                    if (!isMatch) {
                        return res.status(400).json({ success: false, message: 'Invalid email or password' });
                    }
                    if (!user.isActive) {
                        return res.status(403).json({ success: false, message: 'Account is deactivated. Contact admin.' });
                    }
                    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
                    return res.json({
                        success: true,
                        message: 'Login successful',
                        token,
                        user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, preferences: user.preferences }
                    });
                }
                // User not found in DB — fall through to demo check below
            } catch (dbErr) {
                console.error('DB query error during login, falling back to demo:', dbErr.message);
                // Fall through to demo login
            }
        }

        // --- Fallback: Demo credentials (works when DB is offline or unseeded) ---
        const demoUser = DEMO_USERS.find(u => u.email === email);
        if (demoUser && demoUser.password === password) {
            const token = jwt.sign({ id: demoUser._id, role: demoUser.role, demo: true }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
            return res.json({
                success: true,
                message: 'Login successful (demo mode)',
                token,
                user: {
                    id: demoUser._id,
                    name: demoUser.name,
                    email: demoUser.email,
                    role: demoUser.role,
                    phone: demoUser.phone,
                    preferences: demoUser.preferences
                }
            });
        }

        return res.status(400).json({ success: false, message: 'Invalid email or password' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// @route   GET /api/auth/profile
// @desc    Get logged-in user profile
router.get('/profile', auth, async (req, res) => {
    try {
        // req.user is already populated by auth middleware (from DB or demo)
        res.json({ success: true, user: req.user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
router.put('/profile', auth, async (req, res) => {
    try {
        if (!isDbReady()) {
            return res.status(503).json({ success: false, message: 'Database unavailable. Profile updates require a connected database.' });
        }

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

        if (isDbReady()) {
            try {
                const users = await User.find().select('-password').sort('-createdAt');
                return res.json({ success: true, count: users.length, users });
            } catch (dbErr) {
                console.error('DB error fetching users, using demo fallback:', dbErr.message);
            }
        }

        // Fallback: return demo users
        const safeUsers = DEMO_USERS.map(u => ({
            _id: u._id, name: u.name, email: u.email, role: u.role,
            phone: u.phone, isActive: u.isActive, createdAt: u.createdAt
        }));
        res.json({ success: true, count: safeUsers.length, users: safeUsers });
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

        if (!isDbReady()) {
            return res.status(503).json({ success: false, message: 'Database unavailable. Cannot toggle user status.' });
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
