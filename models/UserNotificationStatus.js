const mongoose = require('mongoose');

const userNotificationSchema = new mongoose.Schema({
    email: String,
    phone: String,
    flight_id: String
});

const UserNotification = mongoose.model('UserNotification', userNotificationSchema);

module.exports = { UserNotification };
