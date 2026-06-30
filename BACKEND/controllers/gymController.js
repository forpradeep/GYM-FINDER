const Gym = require('../models/Gym');

const createGym = async (req, res) => {
    try {
        const { title, address, emailId, contact, membershipPrice, images, amenities, lat, lng } = req.body;

        const gym = await Gym.create({
            title,
            address,
            emailId,
            contact,
            membershipPrice,
            images,
            amenities,
            ownerId: req.result._id, 
            location: {
                type: 'Point',
                coordinates: [lng, lat] 
            }
        });

        res.status(201).json({ gym, message: "Gym listed successfully" });
    } catch (err) {
        res.status(400).send('Error: ' + err.message);
    }
}

const getAllGyms = async (req, res) => {
    try {
        const { lat, lng, radius } = req.query;

        if (!lat || !lng) {
          
            const gyms = await Gym.find({});
            return res.status(200).json({ gyms });
        }

        const gyms = await Gym.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: (radius ? parseFloat(radius) : 5) * 1000 
                }
            }
        });

        res.status(200).json({ gyms });
    } catch (err) {
        res.status(400).send('Error: ' + err.message);
    }
}

const getOneGym = async (req, res) => {
    try {
        const gym = await Gym.findById(req.params.id);
        if (!gym) throw new Error("Gym not found");
        res.status(200).json({ gym });
    } catch (err) {
        res.status(404).send('Error: ' + err.message);
    }
}

const updateGym = async (req, res) => {
    try {
        const gym = await Gym.findById(req.params.id);
        if (!gym) throw new Error("Gym not found");

        if (gym.ownerId.toString() !== req.result._id.toString()) {
            throw new Error("You are not authorized to edit this gym");
        }

        const updatedGym = await Gym.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ gym: updatedGym, message: "Gym updated successfully" });
    } catch (err) {
        res.status(400).send('Error: ' + err.message);
    }
}

const deleteGym = async (req, res) => {
    try {
        const gym = await Gym.findById(req.params.id);
        if (!gym) throw new Error("Gym not found");

        if (gym.ownerId.toString() !== req.result._id.toString()) {
            throw new Error("You are not authorized to delete this gym");
        }

        await Gym.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Gym deleted successfully" });
    } catch (err) {
        res.status(400).send('Error: ' + err.message);
    }
}

module.exports = { createGym, getAllGyms, getOneGym, updateGym, deleteGym };
