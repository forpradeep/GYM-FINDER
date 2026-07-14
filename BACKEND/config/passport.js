const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const User = require('../models/User')
const jwt = require('jsonwebtoken')

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // check if user already exists
        let user = await User.findOne({ emailId: profile.emails[0].value })

        if (!user) {
            // create new user
            user = await User.create({
                firstName: profile.displayName.split(' ')[0],
                lastName: profile.displayName.split(' ')[1] || '',
                emailId: profile.emails[0].value,
                password: 'google-oauth-' + profile.id, // placeholder
                role: 'seeker' // default role
            })
        }

        return done(null, user)
    } catch (err) {
        return done(err, null)
    }
}))

module.exports = passport