const amqp = require('amqplib');
const sendEmail = require('../utils/email'); // Ensure you have a sendEmail function set up

const consumeNotifications = async () => {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    const queue = 'notifications';

    await channel.assertQueue(queue, { durable: true });

    console.log('Waiting for messages in queue:', queue);

    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const notification = JSON.parse(msg.content.toString());
        console.log('Received notification:', notification);

        // Send email notification
        await sendEmail(
          'recipient@example.com',
          `Flight ${notification.flight_id} Status Change`,
          notification.message
        );

        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error('Error consuming notifications:', error);
  }
};

module.exports = {
  consumeNotifications
};
