const amqp = require('amqplib');
const config = require('../config');

let channel;

const connect = async () => {
  try {
    const connection = await amqp.connect(config.rabbitMQUrl);
    channel = await connection.createChannel();
    await channel.assertQueue(config.rabbitQueue, { durable: true });
    console.log('RabbitMQ connected and channel created.');
  } catch (err) {
    console.error('Failed to connect to RabbitMQ:', err);
  }
};

const sendMessage = async (message) => {
  try {
    channel.sendToQueue(config.rabbitQueue, Buffer.from(JSON.stringify(message)), { persistent: true });
    console.log('Message sent to RabbitMQ:', message);
  } catch (err) {
    console.error('Failed to send message to RabbitMQ:', err);
  }
};

connect();

module.exports = { sendMessage };
