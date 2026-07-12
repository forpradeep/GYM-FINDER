const express = require('express');
const memberRouter = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const Member = require('../models/Member');

const getEndDate = (startDate, subscriptionType) => {
    const date = new Date(startDate);
    switch(subscriptionType) {
        case 'monthly': date.setMonth(date.getMonth() + 1); break;
        case '3months': date.setMonth(date.getMonth() + 3); break;
        case '6months': date.setMonth(date.getMonth() + 6); break;
        case 'yearly': date.setFullYear(date.getFullYear() + 1); break;
    }
    return date;
}

// ✅ Specific routes FIRST
memberRouter.get('/my-memberships', authMiddleware, async (req, res) => {
    try {
        const members = await Member.find({ phone: req.result.emailId })
            .populate('gymId', 'title address images membershipPrice subscriptionPlans')
            .sort({ createdAt: -1 })
        res.status(200).json({ members })
    } catch (err) {
        res.status(400).send('Error: ' + err.message)
    }
})

memberRouter.delete('/cancel/:memberId', authMiddleware, async (req, res) => {
    try {
        const member = await Member.findById(req.params.memberId)
        if (!member) throw new Error('Membership not found')
        if (member.phone !== req.result.emailId) throw new Error('Not authorized')
        await Member.findByIdAndDelete(req.params.memberId)
        res.status(200).json({ message: 'Membership cancelled successfully' })
    } catch (err) {
        res.status(400).send('Error: ' + err.message)
    }
})

memberRouter.post('/enrol/:gymId', authMiddleware, async (req, res) => {
    try {
        const { subscriptionType, ownerId } = req.body
        const start = new Date()
        const endDate = getEndDate(start, subscriptionType)
        const existing = await Member.findOne({
            gymId: req.params.gymId,
            phone: req.result.emailId
        })
        if (existing) return res.status(400).send('Error: Already enrolled in this gym')
        const member = await Member.create({
            gymId: req.params.gymId,
            ownerId,
            name: req.result.firstName,
            phone: req.result.emailId,
            address: '',
            subscriptionType,
            startDate: start,
            endDate
        })
        res.status(201).json({ member, message: 'Enrolled successfully!' })
    } catch (err) {
        res.status(400).send('Error: ' + err.message)
    }
})

memberRouter.get('/:gymId', authMiddleware, roleMiddleware, async (req, res) => {
    try {
        const members = await Member.find({ gymId: req.params.gymId }).sort({ createdAt: -1 })
        res.status(200).json({ members })
    } catch (err) {
        res.status(400).send('Error: ' + err.message)
    }
})

memberRouter.post('/:gymId', authMiddleware, roleMiddleware, async (req, res) => {
    try {
        const { name, phone, address, subscriptionType, startDate } = req.body
        const start = startDate ? new Date(startDate) : new Date()
        const endDate = getEndDate(start, subscriptionType)
        const member = await Member.create({
            gymId: req.params.gymId,
            ownerId: req.result._id,
            name, phone, address, subscriptionType,
            startDate: start, endDate
        })
        res.status(201).json({ member, message: 'Member added successfully' })
    } catch (err) {
        res.status(400).send('Error: ' + err.message)
    }
})

memberRouter.put('/:memberId', authMiddleware, roleMiddleware, async (req, res) => {
    try {
        const member = await Member.findByIdAndUpdate(req.params.memberId, req.body, { new: true })
        res.status(200).json({ member, message: 'Member updated' })
    } catch (err) {
        res.status(400).send('Error: ' + err.message)
    }
})

memberRouter.delete('/:memberId', authMiddleware, roleMiddleware, async (req, res) => {
    try {
        await Member.findByIdAndDelete(req.params.memberId)
        res.status(200).json({ message: 'Member removed' })
    } catch (err) {
        res.status(400).send('Error: ' + err.message)
    }
})

module.exports = memberRouter;