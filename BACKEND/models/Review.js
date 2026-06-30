const mongoose = require('mongoose');
const { Schema } = mongoose;

const ReviewSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym' },
    comment: { type: String },
    rating: { type: Number, min: 1, max: 5 }
}, { timestamps: true });

const Review = mongoose.model("Review", ReviewSchema);
module.exports = Review;
