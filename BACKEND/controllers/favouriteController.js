const Fav = require('../models/Favourite');

const addFavourite = async (req, res) => {
    try {
        const existing = await Fav.findOne({ userId: req.result._id, gymId: req.params.gymId });
        if (existing) throw new Error("Already in favourites");

        const fav = await Fav.create({ userId: req.result._id, gymId: req.params.gymId });
        res.status(201).json({ fav, message: "Added to favourites" });
    } catch (err) {
        res.status(400).send('Error: ' + err.message);
    }
}

const getFavourites = async (req, res) => {
    try {
        const favs = await Fav.find({ userId: req.result._id }).populate('gymId');
        res.status(200).json({ favs });
    } catch (err) {
        res.status(400).send('Error: ' + err.message);
    }
}

const removeFavourite = async (req, res) => {
    try {
        await Fav.findOneAndDelete({ userId: req.result._id, gymId: req.params.gymId });
        res.status(200).json({ message: "Removed from favourites" });
    } catch (err) {
        res.status(400).send('Error: ' + err.message);
    }
}

module.exports = { addFavourite, getFavourites, removeFavourite };
