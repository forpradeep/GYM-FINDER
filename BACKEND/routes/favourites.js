const express = require('express');
const favouriteRouter = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { addFavourite, getFavourites, removeFavourite } = require('../controllers/favouriteController');

favouriteRouter.post('/:gymId', authMiddleware, addFavourite);
favouriteRouter.get('/', authMiddleware, getFavourites);
favouriteRouter.delete('/:gymId', authMiddleware, removeFavourite);

module.exports = favouriteRouter;
