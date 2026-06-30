const express = require('express');
const reviewRouter = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { addReview, getReviews } = require('../controllers/reviewController');

reviewRouter.post('/:gymId', authMiddleware, addReview);
reviewRouter.get('/:gymId', getReviews);

module.exports = reviewRouter;
