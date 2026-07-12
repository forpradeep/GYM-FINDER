const User = require("../models/User");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validate = require('../utils/validator');

const register = async (req, res) => {
    try {
        validate(req.body);

        const { password } = req.body;
        req.body.password = await bcrypt.hash(password, 10);
        // role comes from req.body ('seeker' or 'owner'), defaults to 'seeker' via schema

        const user = await User.create(req.body);
        const token = jwt.sign(
            { _id: user._id, emailId: user.emailId, role: user.role },
            process.env.JWT_KEY,
            { expiresIn: 7 * 24 * 60 * 60 } // ← 7 days
        );
        // In both login and register, update cookie options:
        res.cookie('token', token, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days instead of 1 hour
            httpOnly: true,
            sameSite: 'lax'
        })
        res.status(201).json({
            user: { _id: user._id, firstName: user.firstName, emailId: user.emailId, role: user.role },
            message: "Registered Successfully"
        });
    } catch (err) {
        res.status(400).send('Error: ' + err.message);
    }
}

const login = async (req, res) => {
    try {
        const { emailId, password } = req.body;

        if (!emailId || !password)
            throw new Error("Invalid Credentials");

        const user = await User.findOne({ emailId });
        if (!user)
            throw new Error("Invalid Credentials");

        const match = await bcrypt.compare(password, user.password);
        if (!match)
            throw new Error("Invalid Credentials");

        const token = jwt.sign(
            { _id: user._id, emailId: user.emailId, role: user.role },
            process.env.JWT_KEY,
            { expiresIn: 7 * 24 * 60 * 60 } // ← 7 days
        );
        res.cookie('token', token, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days instead of 1 hour
            httpOnly: true,
            sameSite: 'lax'
        });
        res.status(200).json({
            user: { _id: user._id, firstName: user.firstName, emailId: user.emailId, role: user.role },
            message: "Logged In Successfully"
        });
    } catch (err) {
        res.status(401).send('Error: ' + err.message);
    }
}

const logout = async (req, res) => {
    try {
        res.cookie("token", null, { expires: new Date(Date.now()) });
        res.send("Logged Out Successfully");
    } catch (err) {
        res.status(503).send("Error: " + err.message);
    }
}

module.exports = { register, login, logout };
