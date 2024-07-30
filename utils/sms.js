const twilio = require('twilio');

// Twilio credentials
const accountSid = process.env.TWILIO_ACC_ID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// Function to send SMS
const sendSMS = (to, message) => {
    return client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: to
    });
};

module.exports = sendSMS;
