# Beachside Racetrack Real-Time System

This project is a real-time system for managing Beachside Racetrack, enabling race preparation, race control, and spectator information updates. It features:

- **Real-time functionality** powered by Socket.IO.
- **Role-based interfaces** for race controllers, spectators, and other personas.
- **Data persistence** using a database.
- **Secure employee interfaces**.

## Features
- **Race Preparation**: Configure races with details like participants, timing, and laps.
- **Race Control**: Monitor and control the race in real time.
- **Spectator Information**: Provide live updates to spectators via a public interface.

---

## How to Start the Server

### Prerequisites
1. Install **[Node.js](https://nodejs.org/en/download)** (>= v14.x):
2. Install **[npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)** (Node Package Manager):
3. Install **[MongoDB](https://www.mongodb.com/docs/manual/installation/)** for database storage (or any other supported database if configured).

### Environment Variables (optional)
Edit the `.env` file in the root of the project with the following variables:

```env
# Server Configuration
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=27017
DB_NAME=beachside_race

# Security Keys
JWT_SECRET=your_jwt_secret_key
```

### Installation
1. Clone the repository:
   ```bash
   git clone https://gitea.kood.tech/andreberezin/racetrack.git
   cd racetrack
   ```

2. Install dependencies:
   ```bash
   npm run install-all
   ```

3. Start the database (if using MongoDB):
   ```bash
   mongod --dbpath /path/to/your/db
   ```

4. Start the server:
   ```bash
   npm start
   ```

The server will be running at `http://localhost:3000`.

---

## User Guide

### Race Preparation
1. **Login**: Log in as an employee to access race preparation features.
2. **Configure a Race**:
    - Navigate to the `Front desk` interface at /front-desk.
    - Fill in the race details:
        - Race name
        - Up to 8 drivers with their names and car numbers

**Screenshot**:
![Race Preparation Screenshot](path/to/image1.png)

### Race Control
1. Access the `Race Control` interface at /race-control.
2. Use the dashboard to:
    - Start the race.
    - Change the race status.
3. Real-time updates will be pushed to connected clients.

**Screenshot**:
![Race Control Screenshot](path/to/image2.png)

### Spectator Information
1. Spectators can access the public interface at /leader-board or on the main screen`.
2. The page shows:
    - Live race updates.
    - Participant rankings.
    - Race status.
   - Race timer.

**Screenshot**:
![Spectator Interface Screenshot](path/to/image3.png)

---

## Codebase Overview

### Directories
- `/src`: Main source code for the application.
    - `/components`: All the components.
- `/public`: Static files.
- `/models`: Database models.

### Key Files
- `server.js`: Entry point of the application.
- `.env`: Configuration file for environment variables.

---

## Real-Time Functionality
- **Socket.IO** is used to provide live updates to spectators and enable communication between race controllers and participants.

---

## Security Measures
- **Role-Based Access Control**: Different features are accessible based on the user's role (e.g., employee vs. spectator).

# Beachside Racetrack Management System

This project is a real-time system designed for managing races at the Beachside Racetrack. It includes race preparation, race control, and live updates for spectators. The system is built using Node.js, Express, Socket.IO, React, and MongoDB Atlas.

## Features
- Real-time race management with live updates.
- Interactive interfaces for different roles, including Receptionist, Safety Official, and Racers.
- Timer and stopwatch functionality for races and laps.
- Remote MongoDB Atlas database integration.
- Configurable race settings.

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) (v16 or later)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
- `.env` file with required environment variables

---

### Installation

1. Clone the repository:
   ```bash
   git clone https://gitea.kood.tech/andreberezin/racetrack.git
   cd racetrack
   ```

2. Install dependencies:
   ```bash
   npm run install-all
   ```

3. Set up the `.env` file in the root directory with the following environment variables:
   ```env
   PORT=3000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/racetrack?retryWrites=true&w=majority
   SAFETY_OF=your_safety_official_key
   LAP_LINE_OBS=your_lap_line_observer_key
   RECEPTIONIST=your_receptionist_key
   RACE_DRIVER=your_race_driver_key
   DEV=your_dev_key
   NODE_ENV=development
   ```

4. Run the server:
   ```bash
   npm start
   ```

## User Guide

### Configuring a Race
1. Navigate to the **Front Desk Interface**.
2. Add a new race by entering the race name and clicking "Add Race".
3. Click on the race name to view its details and add drivers.

### Adding Drivers
1. On the race details page, enter the driver's name and car number.
2. Click "Add Driver" to save the driver to the race.
3. You can edit or remove a driver using the respective buttons.

### Optionally configure the race duration from **Race Settings**

### Starting a Race
1. Go to the **Race Control Interface**.
2. Select a race and click "Start Race".
3. Use the buttons to update the race mode (e.g., Safe, Danger, Hazard).

### Viewing Race Progress
1. Navigate to the **Racing Panel** (home page) to see the race's current progress and lap times.
2. Use the **Next Race** page to view the next race and its drivers.

### Managing Flags
1. Open the **Flag Interface**.
2. The current race flag status will be displayed dynamically, reflecting race conditions.

### Spectator View
- Spectators can view live updates on race progress and standings via the **Leaderboard** page.

---

## Screenshots

### Front Desk Interface
![Front Desk Interface](screenshots/front_desk.png)

### Race Control
![Race Control](screenshots/race_control.png)

### Flag Status
![Flag Status](screenshots/flag_status.png)

---

## Deployment Notes
- Ensure your MongoDB Atlas database is accessible and properly configured.
- Update the allowed origins in `cors` settings to match your frontend's URL.
- Use a reverse proxy like Nginx or a deployment service like Heroku or AWS for production environments.

---

## Tech Stack and Dependencies

### Backend
- ![Node.js](https://img.shields.io/badge/Node.js-20.x-green)
- ![Express](https://img.shields.io/badge/Express-4.21.1-blue)
- ![MongoDB](https://img.shields.io/badge/MongoDB-6.12.0-lightgrey)
- ![Mongoose](https://img.shields.io/badge/Mongoose-8.9.0-brightgreen)
- ![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8.1-orange)

### Frontend
- ![React](https://img.shields.io/badge/React-18.3.1-blue)
- ![Vite](https://img.shields.io/badge/Vite-5.4.10-yellow)
- ![React Router](https://img.shields.io/badge/React%20Router-6.28.0-purple)
- ![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.3-blueviolet)

### General Tools
- ![Ngrok](https://img.shields.io/badge/Ngrok-5.0.0--beta.2-lightgrey)
- ![Nodemon](https://img.shields.io/badge/Nodemon-3.1.7-informational)

## Contributors
- [Your Name](https://github.com/your-profile)

For any issues or feature requests, please open an issue on [GitHub](https://github.com/your-repo/beachside-racetrack).

