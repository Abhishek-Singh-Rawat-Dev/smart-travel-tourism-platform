const mongoose = require('mongoose');

let isConnecting = false;

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) {
        return;
    }
    if (isConnecting) return;

    const uri = process.env.MONGODB_URI;

    // In Vercel serverless, if no remote Atlas URI is provided, don't attempt 127.0.0.1
    if (process.env.VERCEL && (!uri || uri.includes('127.0.0.1') || uri.includes('localhost'))) {
        console.warn('⚠️ Remote MONGODB_URI (e.g. MongoDB Atlas) not configured in Vercel environment variables.');
        return;
    }

    const connectionString = uri || 'mongodb://127.0.0.1:27017/smart-travel-tourism';

    try {
        isConnecting = true;
        const conn = await mongoose.connect(connectionString, {
            serverSelectionTimeoutMS: 3000 // Fast 3s timeout to prevent serverless freeze
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
    } finally {
        isConnecting = false;
    }
};

module.exports = connectDB;
