// write a route to get all flights from the database

const express = require('express');
const FlightStatus = require('../models/FlightStatus');

const router = express.Router();

router.get('/flights', async (req, res) => {
    try {
        const flights = await FlightStatus.find();
        res.json(flights);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;