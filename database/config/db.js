const mongoose = require('mongoose');

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) {
        return;
    }
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart-travel-tourism';
        const conn = await mongoose.connect(uri);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        if (!process.env.VERCEL) {
            console.warn('⚠️ Please ensure MongoDB is running or check your MONGODB_URI.');
        }
    }
};

module.exports = connectDB;
