const express = require('express');
const gymRouter = express.Router();
const roleMiddleware = require("../middleware/roleMiddleware");
const authMiddleware = require("../middleware/authMiddleware");
const { createGym, getAllGyms, getOneGym, updateGym, deleteGym, getOwnerGyms } = require('../controllers/gymController');
const { upload } = require('../config/cloudinary');

gymRouter.post('/upload', authMiddleware,  upload.array('images', 5), async (req, res) => {
    try {
        const urls = req.files.map(file => file.path);
        res.status(200).json({ urls });
    } catch (err) {
        res.status(400).send('Error: ' + err.message);
    }
});

gymRouter.post('/', authMiddleware, roleMiddleware, createGym);
gymRouter.get('/owner', authMiddleware, roleMiddleware, getOwnerGyms);
gymRouter.get('/', getAllGyms);
gymRouter.get('/:id', getOneGym);
gymRouter.put('/:id', authMiddleware, roleMiddleware, updateGym);
gymRouter.delete('/:id', authMiddleware, roleMiddleware, deleteGym);

module.exports = gymRouter;