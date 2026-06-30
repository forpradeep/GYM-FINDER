const mongoose = require('mongoose');
const { Schema } = mongoose;

const FavSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    gymId: { type: Schema.Types.ObjectId, ref: 'Gym' }
}, { timestamps: true });

const Fav = mongoose.model("Fav", FavSchema);
module.exports = Fav;
