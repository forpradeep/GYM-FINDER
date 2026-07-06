const express = require('express');
const gymRouter = express.Router();
const roleMiddleware = require("../middleware/roleMiddleware");
const authMiddleware = require("../middleware/authMiddleware");
const { createGym, getAllGyms, getOneGym, updateGym, deleteGym, getOwnerGyms } = require('../controllers/gymController');

gymRouter.post('/', authMiddleware, roleMiddleware, createGym);
gymRouter.get('/owner', authMiddleware, roleMiddleware, getOwnerGyms); // ✅ before /:id
gymRouter.get('/', getAllGyms);
gymRouter.get('/:id', getOneGym);
gymRouter.put('/:id', authMiddleware, roleMiddleware, updateGym);
gymRouter.delete('/:id', authMiddleware, roleMiddleware, deleteGym);

module.exports = gymRouter;