const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    firstName: { type: String, required: true, minLength: 3, maxLength: 20 },
    lastName: { type: String, minLength: 3, maxLength: 20 },
    emailId: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    age: { type: Number, min: 15, max: 65 },
    role: { type: String, enum: ['seeker', 'owner'], default: 'seeker' }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
module.exports = User;
