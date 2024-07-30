# Indigohack-backend - Real-time Flight Status and Notification System

## Overview

Crispy Palm Tree is a real-time flight status and notification system designed to provide passengers with instant updates on their flight statuses. This system ensures that users are informed of any changes such as delays, cancellations, or gate changes through a user-friendly interface and reliable notifications via email and SMS.

## Features

- *Real-time Updates*: Display current flight statuses using WebSocket for instant updates.
- *Push Notifications*: Send notifications for flight status changes via SMS (Twilio) and email (Mailtrap).
- *Mock Data Integration*: Simulate real-world scenarios using provided mock data for thorough testing and validation.

## Technologies Used

### Frontend

- *HTML*
- *CSS*
- *React.js*: For building dynamic and interactive user interfaces.

### Backend

- *Node.js*: Server-side runtime environment.
- *MongoDB*: NoSQL database for storing flight information and user data.
- *RabbitMQ*: Message broker for managing notification queues.

### Notifications

- *Mailtrap*: For sending email notifications.
- *Twilio*: For sending SMS notifications.

### Real-time Updates

- *WebSocket*: For real-time communication between the server and clients.

## Installation and Setup

1. *Clone the repository*:
   ```sh
   git clone https://github.com/pratyay23/crispy-palm-tree.git
   cd crispy-palm-tree
2. Install dependencies   
    ```sh
    npm install
3. Start server
    ```sh
    npm start  
4. Configure environment variables:

    - Create a .env file in the root directory.
    - Add your MongoDB, Mailtrap, and Twilio credentials to the .env file.

    ```sh
    MONGODB_URI=your_mongodb_uri
    MAILTRAP_USER=your_mailtrap_user
    MAILTRAP_PASS=your_mailtrap_pass
    TWILIO_ACCOUNT_SID=your_twilio_account_sid
    TWILIO_AUTH_TOKEN=your_twilio_auth_token

