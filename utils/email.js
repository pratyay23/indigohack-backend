// Import the Nodemailer library
const nodemailer = require('nodemailer');

// Create a transporter object
const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 2525,
  //   secure: false, // use SSL
  auth: {
    user: process.env.MAILTRAP_USER_ID,
    pass: process.env.MAILTRAP_PASSWORD,
  }
});
// user: "d792298c203d1b",
// pass: "d1e84b2a20bbbf"

const sendEmail = (to, subject, html) => {
  const mailOptions = {
    from: process.env.MAILTRAP_SENDER_EMAIL, // Sender address
    to: to,                           // List of recipients
    subject: subject,                 // Subject line
    html: html                       // Html body
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendEmail;



// // Send the email
// transporter.sendMail(mailOptions, function(error, info){
//   if (error) {
//     console.log('Error:', error);
//   } else {
//     console.log('Email sent: ' + info.response);
//   }});