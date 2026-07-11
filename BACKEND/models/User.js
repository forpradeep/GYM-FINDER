const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    firstName: { type: String, required: true, minLength: 3, maxLength: 20 },
    lastName: { type: String, minLength: 3, maxLength: 20 },
    emailId: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    age: { type: Number, min: 15, max: 65 },
    role: { type: String, enum: ['seeker', 'owner'], default: 'seeker' },

    // Fitness Profile
    height: { type: Number }, // in cm
    weight: { type: Number }, // in kg
    gender: { type: String, enum: ['male', 'female', 'other'] },
    fitnessGoal: { type: String, enum: ['bulk', 'fit', 'lean'] },
    fitnessLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    workoutFrequency: { type: Number, min: 1, max: 7 }, // days per week
    bmi: { type: Number }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
module.exports = User;