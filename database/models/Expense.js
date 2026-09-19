const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    groupName: {
        type: String,
        required: true
    },
    tripDestination: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: String,
        email: String
    }],
    expenses: [{
        description: String,
        amount: { type: Number, required: true },
        category: {
            type: String,
            enum: ['food', 'transport', 'accommodation', 'activities', 'shopping', 'other'],
            default: 'other'
        },
        paidBy: {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            name: String
        },
        splitAmong: [{
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            name: String,
            amount: Number
        }],
        splitType: { type: String, enum: ['equal', 'custom'], default: 'equal' },
        date: { type: Date, default: Date.now },
        receipt: String
    }],
    settlements: [{
        from: { userId: mongoose.Schema.Types.ObjectId, name: String },
        to: { userId: mongoose.Schema.Types.ObjectId, name: String },
        amount: Number,
        settled: { type: Boolean, default: false },
        settledAt: Date
    }],
    totalAmount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Expense', expenseSchema);
