const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Payment = require('../../database/models/Payment');
const Booking = require('../../database/models/Booking');
const auth = require('../middleware/auth');

function isDbReady() { return mongoose.connection.readyState === 1; }

// @route   POST /api/payments/calculate
router.post('/calculate', auth, async (req, res) => {
    try {
        const { bookingId, couponCode } = req.body;
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        const amount = booking.totalAmount;
        const tax = Math.round(amount * 0.18); // 18% GST
        let discount = 0;

        // Simple coupon logic
        const coupons = {
            'TRAVEL10': 0.10, 'FIRST20': 0.20, 'SMART15': 0.15, 'ADVENTURE25': 0.25
        };
        if (couponCode && coupons[couponCode.toUpperCase()]) {
            discount = Math.round(amount * coupons[couponCode.toUpperCase()]);
        }

        const totalAmount = amount + tax - discount;

        res.json({
            success: true,
            breakdown: { baseAmount: amount, tax, discount, totalAmount, couponApplied: couponCode || 'None' }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// @route   POST /api/payments/initiate
router.post('/initiate', auth, async (req, res) => {
    try {
        const { bookingId, amount, tax, discount, totalAmount, method } = req.body;

        const payment = new Payment({
            userId: req.user._id,
            bookingId, amount,
            tax: tax || 0,
            discount: discount || 0,
            totalAmount, method: method || 'card',
            razorpayOrderId: 'order_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 8),
            status: 'pending'
        });

        await payment.save();

        res.status(201).json({
            success: true,
            message: 'Payment initiated',
            payment,
            razorpayOptions: {
                key: process.env.RAZORPAY_KEY_ID,
                amount: totalAmount * 100,
                currency: 'INR',
                name: 'Smart Travel & Tourism',
                description: `Payment for booking`,
                order_id: payment.razorpayOrderId
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// @route   POST /api/payments/verify
router.post('/verify', auth, async (req, res) => {
    try {
        const { paymentId, razorpayPaymentId } = req.body;

        const payment = await Payment.findById(paymentId);
        if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

        // Simulate payment verification (in production, verify with Razorpay)
        payment.razorpayPaymentId = razorpayPaymentId || 'pay_' + Date.now().toString(36);
        payment.status = 'completed';
        payment.receipt = {
            receiptNumber: 'RCP-' + Date.now().toString(36).toUpperCase(),
            generatedAt: new Date(),
            details: `Payment of ₹${payment.totalAmount} completed successfully`
        };
        await payment.save();

        // Update booking status
        await Booking.findByIdAndUpdate(payment.bookingId, { paymentStatus: 'paid', status: 'confirmed' });

        res.json({ success: true, message: 'Payment verified successfully!', payment });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// @route   GET /api/payments/receipt/:id
router.get('/receipt/:id', auth, async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id).populate('bookingId').populate('userId', 'name email');
        if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
        res.json({ success: true, receipt: payment });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/payments/history
router.get('/history', auth, async (req, res) => {
    try {
        if (!isDbReady()) return res.json({ success: true, count: 0, payments: [] });
        const payments = await Payment.find({ userId: req.user._id }).populate('bookingId').sort('-createdAt');
        res.json({ success: true, count: payments.length, payments });
    } catch (error) {
        res.json({ success: true, count: 0, payments: [] });
    }
});

module.exports = router;
