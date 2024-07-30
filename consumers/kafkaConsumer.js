const kafka = require('kafka-node');
const { sendMessage } = require('../utils/rabbitmq');
const config = require('../config');

const client = new kafka.KafkaClient({ kafkaHost: config.kafkaHost });
const consumer = new kafka.Consumer(
  client,
  [{ topic: config.kafkaTopic, partition: 0 }],
  { autoCommit: true }
);

consumer.on('message', async (message) => {
  const flightStatusUpdate = JSON.parse(message.value);
  console.log('Received flight status update from Kafka:', flightStatusUpdate);
  
  // Process flight status update and send notification via RabbitMQ
  const notificationMessage = `Flight ${flightStatusUpdate.flight_id} is now ${flightStatusUpdate.status}`;
  await sendMessage({ message: notificationMessage, flight: flightStatusUpdate });
});

consumer.on('error', (err) => {
  console.error('Kafka Consumer error:', err);
});
