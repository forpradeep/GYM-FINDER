const express = require('express');
const userRouter = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');

// GET /api/users/profile — get logged in user's profile
userRouter.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.result._id).select('-password');
        res.status(200).json({ user });
    } catch (err) {
        res.status(400).send('Error: ' + err.message);
    }
})

// PUT /api/users/profile — update profile
userRouter.put('/profile', authMiddleware, async (req, res) => {
    try {
        const { height, weight, gender, fitnessGoal, fitnessLevel, workoutFrequency, age } = req.body;

        // calculate BMI
        let bmi = null;
        if (height && weight) {
            const heightInMeters = height / 100;
            bmi = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
        }

        const user = await User.findByIdAndUpdate(
            req.result._id,
            { height, weight, gender, fitnessGoal, fitnessLevel, workoutFrequency, age, bmi },
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({ user, message: "Profile updated successfully" });
    } catch (err) {
        res.status(400).send('Error: ' + err.message);
    }
})

module.exports = userRouter;