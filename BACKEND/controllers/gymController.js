const Gym = require('../models/Gym');
const Review = require('../models/Review');

const createGym = async (req, res) => {
    try {
        const { title, address, emailId, contact, membershipPrice, images, amenities, lat, lng, socialLinks, subscriptionPlans, timing } = req.body;

        const gym = await Gym.create({
            title,
            address,
            emailId,
            contact,
            membershipPrice,
            images,
            amenities,
            socialLinks,
            subscriptionPlans,
            timing,
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
        const { lat, lng, radius, search } = req.query;

        let gyms;

        if (search) {
            gyms = await Gym.find({
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { address: { $regex: search, $options: 'i' } }
                ]
            });
        } else if (lat && lng) {
            gyms = await Gym.find({
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
        } else {
            gyms = await Gym.find({});
        }

        // add average rating to each gym
        const gymsWithRatings = await Promise.all(gyms.map(async (gym) => {
            const reviews = await Review.find({ gymId: gym._id })
            const avgRating = reviews.length > 0
                ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                : null
            return {
                ...gym.toObject(),
                averageRating: avgRating,
                reviewCount: reviews.length
            }
        }))

        res.status(200).json({ gyms: gymsWithRatings });
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

const getOwnerGyms = async (req, res) => {
    try {
        const gyms = await Gym.find({ ownerId: req.result._id });
        res.status(200).json({ gyms });
    } catch (err) {
        res.status(400).send('Error: ' + err.message);
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

module.exports = { createGym, getAllGyms, getOneGym, updateGym, deleteGym, getOwnerGyms };