const mongoose = require('mongoose');

let isConnecting = false;

// Disable Mongoose buffering and autoIndex in serverless to prevent background timeouts
mongoose.set('bufferCommands', false);
mongoose.set('autoIndex', false);

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) {
        return;
    }
    if (isConnecting) return;

    const uri = process.env.MONGODB_URI;

    const isServerlessOrProd = process.env.VERCEL || process.env.VERCEL_ENV || process.env.NODE_ENV === 'production' || !process.env.PORT;

    if (!uri || uri.includes('127.0.0.1') || uri.includes('localhost')) {
        if (isServerlessOrProd) {
            console.warn('⚠️ Remote MONGODB_URI not set. Running in demo mode without DB connection.');
            return;
        }
    }

    const connectionString = uri || 'mongodb://127.0.0.1:27017/smart-travel-tourism';

    try {
        isConnecting = true;
        const conn = await mongoose.connect(connectionString, {
            serverSelectionTimeoutMS: 2000,
            connectTimeoutMS: 2000,
            bufferCommands: false,
            autoIndex: false
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
    } finally {
        isConnecting = false;
    }
};

module.exports = connectDB;
