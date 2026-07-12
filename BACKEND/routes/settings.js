const express = require('express')
const settingsRouter = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const { sendOTP } = require('../config/mailer')

// Store OTPs temporarily in memory
const otpStore = {}

// POST /api/settings/send-otp — send OTP to user's email
settingsRouter.post('/send-otp', authMiddleware, async (req, res) => {
    try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const email = req.result.emailId

        otpStore[email] = {
            otp,
            expires: Date.now() + 10 * 60 * 1000 // 10 minutes
        }

        await sendOTP(email, otp)
        res.status(200).json({ message: 'OTP sent to your email' })
    } catch (err) {
        res.status(400).send('Error: ' + err.message)
    }
})

// PUT /api/settings/update-name — update first name
settingsRouter.put('/update-name', authMiddleware, async (req, res) => {
    try {
        const { firstName } = req.body
        const user = await User.findByIdAndUpdate(
            req.result._id,
            { firstName },
            { new: true }
        ).select('-password')
        res.status(200).json({ user, message: 'Name updated successfully' })
    } catch (err) {
        res.status(400).send('Error: ' + err.message)
    }
})

// PUT /api/settings/update-email — update email with OTP
settingsRouter.put('/update-email', authMiddleware, async (req, res) => {
    try {
        const { newEmail, otp } = req.body
        const email = req.result.emailId
        const stored = otpStore[email]

        if (!stored) return res.status(400).send('Error: No OTP found. Please request a new one.')
        if (Date.now() > stored.expires) return res.status(400).send('Error: OTP expired')
        if (stored.otp !== otp) return res.status(400).send('Error: Invalid OTP')

        delete otpStore[email]

        const user = await User.findByIdAndUpdate(
            req.result._id,
            { emailId: newEmail },
            { new: true }
        ).select('-password')

        res.status(200).json({ user, message: 'Email updated successfully' })
    } catch (err) {
        res.status(400).send('Error: ' + err.message)
    }
})

// PUT /api/settings/update-password — update password with OTP
settingsRouter.put('/update-password', authMiddleware, async (req, res) => {
    try {
        const { newPassword, otp } = req.body
        const email = req.result.emailId
        const stored = otpStore[email]

        if (!stored) return res.status(400).send('Error: No OTP found. Please request a new one.')
        if (Date.now() > stored.expires) return res.status(400).send('Error: OTP expired')
        if (stored.otp !== otp) return res.status(400).send('Error: Invalid OTP')

        delete otpStore[email]

        const hashedPassword = await bcrypt.hash(newPassword, 10)
        await User.findByIdAndUpdate(req.result._id, { password: hashedPassword })

        res.status(200).json({ message: 'Password updated successfully' })
    } catch (err) {
        res.status(400).send('Error: ' + err.message)
    }
})

module.exports = settingsRouter