require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();
const connectDB = require('./utils/db');

const flightRoute = require('./routes/flightRoute');
const userNotificationRoute = require('./routes/userNotification');

app.use(express.json());
app.use(cors());

app.use(flightRoute);
app.use(userNotificationRoute)

const { startCron } = require("./main");
const { consumeNotifications } = require("./rabbitConfig/consumeNotification");

async function startServer() {
    try {
        connectDB();
        await startCron();
        await consumeNotifications();
        app.listen(8000, async () => {
            console.log('Server is running on port 3000');
        });
    } catch (error) {
        console.error('server failing', error)
    }
}

startServer();