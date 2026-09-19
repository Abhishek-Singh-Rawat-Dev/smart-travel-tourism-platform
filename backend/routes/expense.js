const express = require('express');
const router = express.Router();
const Expense = require('../../database/models/Expense');
const auth = require('../middleware/auth');

// @route   POST /api/expenses/group
router.post('/group', auth, async (req, res) => {
    try {
        const { groupName, tripDestination, members } = req.body;
        
        const group = new Expense({
            groupName,
            tripDestination,
            createdBy: req.user._id,
            members: [
                { userId: req.user._id, name: req.user.name, email: req.user.email },
                ...(members || [])
            ]
        });

        await group.save();
        res.status(201).json({ success: true, message: 'Expense group created!', group });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// @route   POST /api/expenses/add
router.post('/add', auth, async (req, res) => {
    try {
        const { groupId, description, amount, category, paidByName, splitType, splitAmong } = req.body;

        const group = await Expense.findById(groupId);
        if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

        let splits;
        if (splitType === 'equal') {
            const splitAmount = Math.round((amount / group.members.length) * 100) / 100;
            splits = group.members.map(m => ({ userId: m.userId, name: m.name, amount: splitAmount }));
        } else {
            splits = splitAmong || [];
        }

        group.expenses.push({
            description, amount, category: category || 'other',
            paidBy: { userId: req.user._id, name: paidByName || req.user.name },
            splitAmong: splits,
            splitType: splitType || 'equal'
        });

        group.totalAmount = group.expenses.reduce((sum, e) => sum + e.amount, 0);
        await group.save();

        res.json({ success: true, message: 'Expense added!', group });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// @route   GET /api/expenses/group/:id
router.get('/group/:id', auth, async (req, res) => {
    try {
        const group = await Expense.findById(req.params.id);
        if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
        res.json({ success: true, group });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/expenses/my-groups
router.get('/my-groups', auth, async (req, res) => {
    try {
        const groups = await Expense.find({
            $or: [
                { createdBy: req.user._id },
                { 'members.userId': req.user._id }
            ]
        }).sort('-createdAt');
        res.json({ success: true, count: groups.length, groups });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/expenses/split/:groupId
router.get('/split/:groupId', auth, async (req, res) => {
    try {
        const group = await Expense.findById(req.params.groupId);
        if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

        // Calculate who owes whom
        const balances = {};
        group.members.forEach(m => { balances[m.name] = 0; });

        group.expenses.forEach(expense => {
            const payer = expense.paidBy.name;
            balances[payer] = (balances[payer] || 0) + expense.amount;
            expense.splitAmong.forEach(split => {
                balances[split.name] = (balances[split.name] || 0) - split.amount;
            });
        });

        // Generate settlements
        const settlements = [];
        const debtors = [];
        const creditors = [];

        Object.entries(balances).forEach(([name, balance]) => {
            if (balance < 0) debtors.push({ name, amount: Math.abs(balance) });
            else if (balance > 0) creditors.push({ name, amount: balance });
        });

        debtors.sort((a, b) => b.amount - a.amount);
        creditors.sort((a, b) => b.amount - a.amount);

        let i = 0, j = 0;
        while (i < debtors.length && j < creditors.length) {
            const amount = Math.min(debtors[i].amount, creditors[j].amount);
            if (amount > 0.01) {
                settlements.push({
                    from: debtors[i].name,
                    to: creditors[j].name,
                    amount: Math.round(amount * 100) / 100
                });
            }
            debtors[i].amount -= amount;
            creditors[j].amount -= amount;
            if (debtors[i].amount < 0.01) i++;
            if (creditors[j].amount < 0.01) j++;
        }

        res.json({
            success: true,
            groupName: group.groupName,
            totalExpenses: group.totalAmount,
            perPersonAvg: Math.round(group.totalAmount / group.members.length),
            balances,
            settlements,
            expenseBreakdown: group.expenses.map(e => ({
                description: e.description,
                amount: e.amount,
                category: e.category,
                paidBy: e.paidBy.name,
                date: e.date
            }))
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/expenses/settle
router.put('/settle', auth, async (req, res) => {
    try {
        const { groupId, from, to, amount } = req.body;
        const group = await Expense.findById(groupId);
        if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

        group.settlements.push({
            from: { name: from },
            to: { name: to },
            amount,
            settled: true,
            settledAt: new Date()
        });
        await group.save();

        res.json({ success: true, message: `₹${amount} settled from ${from} to ${to}` });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
