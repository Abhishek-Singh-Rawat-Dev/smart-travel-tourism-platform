const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../../database/models/User');
const { DEMO_USERS } = require('../../database/seeds/seedData');

const JWT_SECRET = process.env.JWT_SECRET || 'smartTravelTourism2024SecretKey_x7k9m2p';

function isDbReady() {
    const uri = process.env.MONGODB_URI;
    if (!uri || uri.includes('127.0.0.1') || uri.includes('localhost')) {
        return false;
    }
    return mongoose.connection && mongoose.connection.readyState === 1;
}

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Access denied. No token provided.' 
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        // If token was issued for a demo user (DB offline), use demo data
        if (decoded.demo) {
            const demoUser = DEMO_USERS.find(u => u._id === decoded.id);
            if (demoUser) {
                req.user = {
                    _id: demoUser._id,
                    name: demoUser.name,
                    email: demoUser.email,
                    role: demoUser.role,
                    phone: demoUser.phone,
                    isActive: demoUser.isActive,
                    preferences: demoUser.preferences,
                    providerDetails: demoUser.providerDetails
                };
                return next();
            }
        }

        // Try fetching from DB safely
        if (isDbReady()) {
            try {
                const userQuery = User.findById(decoded.id).select('-password').lean().exec().catch(err => {
                    console.warn('DB error in auth middleware caught safely:', err.message);
                    return null;
                });
                const user = await Promise.race([
                    userQuery,
                    new Promise(resolve => setTimeout(() => resolve(null), 1200))
                ]);
                if (user) {
                    req.user = user;
                    return next();
                }
            } catch (dbErr) {
                console.error('DB error in auth middleware:', dbErr.message);
            }
        }

        // Fallback: check demo users by decoded.id
        const fallbackUser = DEMO_USERS.find(u => u._id === decoded.id);
        if (fallbackUser) {
            req.user = {
                _id: fallbackUser._id,
                name: fallbackUser.name,
                email: fallbackUser.email,
                role: fallbackUser.role,
                phone: fallbackUser.phone,
                isActive: fallbackUser.isActive,
                preferences: fallbackUser.preferences,
                providerDetails: fallbackUser.providerDetails
            };
            return next();
        }

        return res.status(401).json({ 
            success: false, 
            message: 'Token is not valid. User not found.' 
        });
    } catch (error) {
        res.status(401).json({ 
            success: false, 
            message: 'Token is not valid or expired.' 
        });
    }
};

module.exports = auth;
