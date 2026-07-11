const mongoose = require('mongoose');
const { Schema } = mongoose;

const MemberSchema = new Schema({
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym', required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String },
    subscriptionType: {
        type: String,
        enum: ['monthly', '3months', '6months', 'yearly'],
        required: true
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Member', MemberSchema);