const jwt = require('jsonwebtoken')
const express = require('express');
const authRouter = express.Router();
const { register, login, logout } = require('../controllers/authController');
const passport = require('../config/passport')

// Google OAuth routes
authRouter.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'], session: false })
)

authRouter.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login` }),
    async (req, res) => {
        try {
            const token = jwt.sign(
                { _id: req.user._id, emailId: req.user.emailId, role: req.user.role },
                process.env.JWT_KEY,
                { expiresIn: 7 * 24 * 60 * 60 }
            )
            res.cookie('token', token, {
                maxAge: 7 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                sameSite: 'lax'
            })
            // redirect to frontend with user data
            res.redirect(`${process.env.FRONTEND_URL}/auth/google/success?user=${encodeURIComponent(JSON.stringify({
                _id: req.user._id,
                firstName: req.user.firstName,
                emailId: req.user.emailId,
                role: req.user.role
            }))}`)
        } catch (err) {
            res.redirect(`${process.env.FRONTEND_URL}/login`)
        }
    }
)

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);

module.exports = authRouter;
