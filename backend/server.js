const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('../database/config/db');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend directory
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/trips', require('./routes/tripPlanner'));
app.use('/api/bookings', require('./routes/booking'));
app.use('/api/payments', require('./routes/payment'));
app.use('/api/prices', require('./routes/priceTracker'));
app.use('/api/nearby', require('./routes/nearbyServices'));
app.use('/api/navigation', require('./routes/navigation'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/explore', require('./routes/explore'));
app.use('/api/emergency', require('./routes/emergency'));
app.use('/api/network', require('./routes/networkCoverage'));
app.use('/api/expenses', require('./routes/expense'));
app.use('/api/roads', require('./routes/roadCondition'));
app.use('/api/permits', require('./routes/permit'));
app.use('/api/bluetooth', require('./routes/bluetooth'));

// Serve frontend pages
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Catch-all: serve page or fallback to index.html for SPA-like navigation
app.get('/pages/*', (req, res) => {
    const page = req.params[0];
    const filePath = path.join(frontendPath, 'pages', page);
    res.sendFile(filePath, (err) => {
        if (err) {
            res.sendFile(path.join(frontendPath, 'index.html'));
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`\n🚀 Smart Travel & Tourism Platform`);
        console.log(`📡 Backend Server running on http://localhost:${PORT}`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
    });
}

module.exports = app;
