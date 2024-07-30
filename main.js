const cron = require('node-cron');
const connectDB = require('./utils/db');
const FlightStatus = require('./models/FlightStatus');
const WebSocket = require('ws');
const sendEmail = require('./utils/email');
const { publishNotification } = require('./rabbitConfig/publishNotification');
const sendSMS = require('./utils/sms'); // Import the sendSMS function
const { UserNotification } = require('./models/UserNotificationStatus');


// Connect to MongoDB
connectDB();

// Create WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Store previous statuses to detect changes
let previousStatuses = {};

// Flight statuses with random updates
const flightStatuses = [
  {
    flight_id: '6E 2341',
    airline: 'Indigo',
    status: 'On Time',
    departure_gate: 'A12',
    arrival_gate: 'B7',
    scheduled_departure: new Date('2024-07-26T14:00:00Z'),
    scheduled_arrival: new Date('2024-07-26T18:00:00Z'),
    actual_departure: null,
    actual_arrival: null,
  },
  {
    flight_id: '6E 2342',
    airline: 'Indigo',
    status: 'Delayed',
    departure_gate: 'C3',
    arrival_gate: 'D4',
    scheduled_departure: new Date('2024-07-26T16:00:00Z'),
    scheduled_arrival: new Date('2024-07-26T20:00:00Z'),
    actual_departure: null,
    actual_arrival: null,
  },
  {
    flight_id: '6E 2343',
    airline: 'Indigo',
    status: 'Cancelled',
    departure_gate: 'E2',
    arrival_gate: 'F1',
    scheduled_departure: new Date('2024-07-26T12:00:00Z'),
    scheduled_arrival: new Date('2024-07-26T16:00:00Z'),
    actual_departure: null,
    actual_arrival: null,
  },
];

// Function to generate random status changes
const getRandomStatus = () => {
  const statuses = ['On Time', 'Delayed', 'Cancelled'];
  return statuses[Math.floor(Math.random() * statuses.length)];
};

const getRandomGate = () => {
  const gates = ['A1', 'A2', 'A3', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2'];
  return gates[Math.floor(Math.random() * gates.length)];
};

async function addRandomFlight() {
  const newFlight = {
    flight_id: getRandomFlightId(),
    status: getRandomStatus(),
    departure_gate: getRandomGate(),
    arrival_gate: getRandomGate(),
    last_updated: new Date(),
  };

  await FlightStatus.create(newFlight);
}

async function updateRandomFlights(flightStatuses, updateCount) {
  const shuffledFlights = flightStatuses.sort(() => 0.5 - Math.random());
  const flightsToUpdate = shuffledFlights.slice(0, updateCount);

  for (const flight of flightsToUpdate) {
    flight.status = getRandomStatus();
    flight.departure_gate = getRandomGate();
    flight.arrival_gate = getRandomGate();
    flight.last_updated = new Date();

    await FlightStatus.findOneAndUpdate(
      { flight_id: flight.flight_id },
      flight,
      { upsert: true, new: true }
    );
  }
}

// Function to generate HTML email content
const generateEmailContent = (flight, previousStatus) => {
  let message;
  switch (flight.status) {
    case 'Delayed':
      message = `We regret to inform you that your flight ${flight.flight_id} has been delayed. The new departure gate is ${flight.departure_gate} and the new arrival gate is ${flight.arrival_gate}.`;
      break;
    case 'Cancelled':
      message = `We regret to inform you that your flight ${flight.flight_id} has been cancelled. Please contact our support team for further assistance.`;
      break;
    case 'On Time':
    default:
      message = `We are pleased to inform you that your flight ${flight.flight_id} is on time. Your departure gate is ${flight.departure_gate} and your arrival gate is ${flight.arrival_gate}.`;
      break;
  }

  return `
        <html>
        <body>
            <p>Dear User,</p>
            <p>${message}</p>
            <p>Thank you for flying with us.</p>
            <p>Best regards,</p>
            <p>Lauda Lassan Airline</p>
        </body>
        </html>
    `;
};

// Function to compare and detect status changes
const detectStatusChanges = async () => {
  try {
    const flightStatuses = await FlightStatus.find({}).sort({ last_updated: -1 });

    for (const flight of flightStatuses) {
      const previousStatus = previousStatuses[flight.flight_id];

      if (previousStatus && previousStatus.status !== flight.status) {
        console.log(`Status change detected for flight ${flight.flight_id}: ${previousStatus.status} -> ${flight.status}`);

        const notification = {
          flight_id: flight.flight_id,
          old_status: previousStatus.status,
          new_status: flight.status,
          message: `Flight ${flight.flight_id} status changed from ${previousStatus.status} to ${flight.status}`
        };

        // Fetch user notifications related to this flight
        const userNotifications = await UserNotification.find({ flight_id: flight.flight_id });

        for (const user of userNotifications) {
          // Generate email content
          const emailContent = generateEmailContent(flight, previousStatus);

          // Send email notification
          sendEmail(user.email, `Flight ${flight.flight_id} Status Change`, emailContent)
            .then(() => console.log(`Email sent to ${user.email} for flight ${flight.flight_id}`))
            .catch((error) => console.error(`Error sending email to ${user.email} for flight ${flight.flight_id}:`, error));

          // Send SMS notification
          sendSMS(user.phone, `Dear user, your flight ${flight.flight_id} status has changed to ${flight.status}. Departure gate: ${flight.departure_gate}, Arrival gate: ${flight.arrival_gate}.`)
            .then(() => console.log(`SMS sent to ${user.phone} for flight ${flight.flight_id}`))
            .catch((error) => console.error(`Error sending SMS to ${user.phone} for flight ${flight.flight_id}:`, error));
        }

        // Publish notification to RabbitMQ
        publishNotification(notification);

        // Send WebSocket notifications
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: 'statusChange',
              ...notification
            }));
          }
        });
      }

      // Update previous statuses
      previousStatuses[flight.flight_id] = flight;
    }
  } catch (error) {
    console.error('Error detecting status change:', error);
  }
};


// Cron job to update flight statuses with random changes every 30 seconds
async function startCron() {
  try {
    cron.schedule('*/30 * * * * *', async () => {
      console.log('Updating flight statuses...');

      // Add a new flight occasionally (10% chance)
      if (Math.random() < 0.1) {
        await addRandomFlight();
        console.log('Added a new random flight.');
      }

      // Fetch all flight statuses
      const flightStatuses = await FlightStatus.find();

      // Update a few random flights (e.g., 20% of the flights)
      const updateCount = Math.ceil(flightStatuses.length * 0.2);
      await updateRandomFlights(flightStatuses, updateCount);

      console.log('Flight statuses updated.');

      // Detect and notify status changes
      await detectStatusChanges();
    });
  } catch (error) {
    console.error('cron failing', error);
  }
}


module.exports = {
  startCron
}