const mongoose = require('mongoose');
const { Schema } = mongoose;

const GymSchema = new Schema({
    title: { type: String, required: true, minLength: 3, maxLength: 50 },
    address: { type: String, minLength: 3, maxLength: 200 },
    emailId: { type: String, required: true, unique: true, trim: true, lowercase: true },
    contact: { type: Number },
    membershipPrice: { type: Number },
    images: [String],
    amenities: [String],
    location: {
        type: { type: String, default: 'Point' },
        coordinates: [Number]
    },
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

GymSchema.index({ location: '2dsphere' });

const Gym = mongoose.model("Gym", GymSchema);
module.exports = Gym;
