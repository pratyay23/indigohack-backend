const express = require('express');
const router = express.Router();
const { UserNotification } = require('../models/UserNotificationStatus');

router.post('/register-notification', async (req, res) => {
    const { email, phone, flight_id } = req.body;

    try {
        const newNotification = new UserNotification({ email, phone, flight_id });
        await newNotification.save();
        res.status(201).send('Notification registered successfully');
    } catch (error) {
        console.error('Error registering notification: ', error);
        res.status(500).send('Server error');
    }
});

module.exports = router;
