const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();

// ✅ CORS must be first before any routes
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());

const authRouter = require('./routes/auth');
const gymRouter = require('./routes/gyms');
const reviewRouter = require('./routes/reviews');
const favouriteRouter = require('./routes/favourites');
const userRouter = require('./routes/users');
const memberRouter = require('./routes/members');
const settingsRouter = require('./routes/settings')
app.use('/api/settings', settingsRouter)

app.use('/api/auth', authRouter);
app.use('/api/gyms', gymRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/favourites', favouriteRouter);
app.use('/api/users', userRouter);
app.use('/api/members', memberRouter);

async function main() {
    await connectDB();
}

main()
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log("Server listening at port: " + process.env.PORT);
        })
    })
    .catch(err => console.log("Error Occurred: " + err));