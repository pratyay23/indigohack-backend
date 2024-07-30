const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    flight_id: String,
    email: String,
    phone: String,
    last_notified_status: String
});

const Notification = mongoose.model('Notification', NotificationSchema);
