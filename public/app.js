const flightsContainer = document.getElementById('flights');

// Create WebSocket connection
const socket = new WebSocket('ws://localhost:8080');

socket.onopen = () => {
    console.log('Connected to WebSocket server');
};

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'statusChange') {
        console.log(`Notification: ${data.message}`);
    } else if (Array.isArray(data)) {
        flightsContainer.innerHTML = ''; // Clear existing data
        data.forEach(updateFlightStatus);
    }
};

socket.onclose = () => {
    console.log('Disconnected from WebSocket server');
};

const updateFlightStatus = (flight) => {
    const flightDiv = document.createElement('div');
    flightDiv.id = flight.flight_id;
    
    flightDiv.innerHTML = `
        <strong>Flight ID:</strong> ${flight.flight_id} <br>
        <strong>Airline:</strong> ${flight.airline} <br>
        <strong>Status:</strong> ${flight.status} <br>
        <strong>Departure Gate:</strong> ${flight.departure_gate} <br>
        <strong>Arrival Gate:</strong> ${flight.arrival_gate} <br>
        <strong>Scheduled Departure:</strong> ${new Date(flight.scheduled_departure).toLocaleString()} <br>
        <strong>Scheduled Arrival:</strong> ${new Date(flight.scheduled_arrival).toLocaleString()} <br>
        <strong>Actual Departure:</strong> ${flight.actual_departure ? new Date(flight.actual_departure).toLocaleString() : 'N/A'} <br>
        <strong>Actual Arrival:</strong> ${flight.actual_arrival ? new Date(flight.actual_arrival).toLocaleString() : 'N/A'} <br>
        <hr>
    `;

    flightsContainer.appendChild(flightDiv);
};
