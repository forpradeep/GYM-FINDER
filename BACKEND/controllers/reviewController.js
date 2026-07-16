const Review = require('../models/Review');

const addReview = async (req, res) => {
    try {
        const { comment, rating, images } = req.body
        const review = await Review.create({
            userId: req.result._id,
            gymId: req.params.gymId,
            comment,
            rating,
            images: images || []
        })
        res.status(201).json({ review, message: "Review added" })
    } catch (err) {
        res.status(400).send('Error: ' + err.message)
    }
}

const getReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ gymId: req.params.gymId }).populate('userId', 'firstName lastName');
        res.status(200).json({ reviews });
    } catch (err) {
        res.status(400).send('Error: ' + err.message);
    }
}

module.exports = { addReview, getReviews };
