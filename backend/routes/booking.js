const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Booking = require('../../database/models/Booking');
const Destination = require('../../database/models/Destination');
const auth = require('../middleware/auth');

function isDbReady() { return mongoose.connection.readyState === 1; }

// @route   POST /api/bookings/hotel
router.post('/hotel', auth, async (req, res) => {
    try {
        const { hotelName, roomType, checkIn, checkOut, guests, destination, totalAmount, specialRequests } = req.body;
        const booking = new Booking({
            userId: req.user._id,
            type: 'hotel',
            hotelName, roomType, checkIn, checkOut,
            guests: guests || 1,
            destination, totalAmount,
            specialRequests
        });
        await booking.save();
        res.status(201).json({ success: true, message: 'Hotel booked successfully!', booking });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// @route   POST /api/bookings/cab
router.post('/cab', auth, async (req, res) => {
    try {
        const { pickupLocation, dropLocation, cabType, rideDate, destination, totalAmount } = req.body;
        const booking = new Booking({
            userId: req.user._id,
            type: 'cab',
            pickupLocation, dropLocation, cabType,
            rideDate, destination, totalAmount
        });
        await booking.save();
        res.status(201).json({ success: true, message: 'Cab booked successfully!', booking });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// @route   POST /api/bookings/adventure
router.post('/adventure', auth, async (req, res) => {
    try {
        const { activityName, activityType, slots, activityDate, destination, totalAmount } = req.body;
        const booking = new Booking({
            userId: req.user._id,
            type: 'adventure',
            activityName, activityType, slots,
            activityDate, destination, totalAmount
        });
        await booking.save();
        res.status(201).json({ success: true, message: 'Adventure activity booked!', booking });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// @route   GET /api/bookings/my-bookings
router.get('/my-bookings', auth, async (req, res) => {
    try {
        if (!isDbReady()) return res.json({ success: true, count: 0, bookings: [] });
        const bookings = await Booking.find({ userId: req.user._id }).sort('-createdAt');
        res.json({ success: true, count: bookings.length, bookings });
    } catch (error) {
        res.json({ success: true, count: 0, bookings: [] });
    }
});

// @route   GET /api/bookings/all (Admin)
router.get('/all', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }
        if (!isDbReady()) return res.json({ success: true, count: 0, bookings: [] });
        const bookings = await Booking.find().populate('userId', 'name email').sort('-createdAt');
        res.json({ success: true, count: bookings.length, bookings });
    } catch (error) {
        res.json({ success: true, count: 0, bookings: [] });
    }
});

// @route   GET /api/bookings/:id
router.get('/:id', auth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
        res.json({ success: true, booking });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/bookings/:id/confirm
router.put('/:id/confirm', auth, async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(req.params.id, { status: 'confirmed' }, { new: true });
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
        res.json({ success: true, message: 'Booking confirmed!', booking });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/bookings/:id/cancel
router.put('/:id/cancel', auth, async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(req.params.id, { status: 'cancelled' }, { new: true });
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
        res.json({ success: true, message: 'Booking cancelled', booking });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/bookings/services/:destination
router.get('/services/:destination', async (req, res) => {
    try {
        const dest = await Destination.findOne({ name: new RegExp(req.params.destination, 'i') });
        if (!dest) return res.status(404).json({ success: false, message: 'Destination not found' });
        res.json({ success: true, services: dest.services, destination: dest.name });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
