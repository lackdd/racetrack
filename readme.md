// 1. How to start the server, including any environment variables which must be set.
// 2. It must have a user guide, which shows how to use the system. For example, with screenshots which describe how to configure a race.

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
1. Install **Node.js** (>= v14.x).
2. Install **npm** (Node Package Manager).
3. Install **MongoDB** for database storage (or any other supported database if configured).

### Environment Variables
Create a `.env` file in the root of the project with the following variables:

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
   git clone <repository-url>
   cd beachside-racetrack
   ```

2. Install dependencies:
   ```bash
   npm install
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
    - Navigate to the `Race Preparation` section.
    - Fill in details like:
        - Race name
        - Participants (add details for each participant)
        - Number of laps
        - Timing information
    - Save the configuration.

**Screenshot**:
![Race Preparation Screenshot](path/to/image1.png)

### Race Control
1. Access the `Race Control` panel.
2. Use the dashboard to:
    - Start the race.
    - Monitor progress (e.g., lap completions, participant rankings).
    - Pause or stop the race if needed.
3. Real-time updates will be pushed to connected clients.

**Screenshot**:
![Race Control Screenshot](path/to/image2.png)

### Spectator Information
1. Spectators can access the public interface via `http://localhost:3000/spectator`.
2. The page shows:
    - Live race updates.
    - Participant rankings.
    - Race status (e.g., ongoing, completed).

**Screenshot**:
![Spectator Interface Screenshot](path/to/image3.png)

---

## Codebase Overview

### Directories
- `/src`: Main source code for the application.
    - `/controllers`: Request handlers for the API endpoints.
    - `/models`: Database models.
    - `/routes`: API route definitions.
    - `/services`: Business logic and services.
- `/public`: Static files for the spectator interface.

### Key Files
- `server.js`: Entry point of the application.
- `.env`: Configuration file for environment variables.

---

## Real-Time Functionality
- **Socket.IO** is used to provide live updates to spectators and enable communication between race controllers and participants.

---

## Security Measures
- **Authentication**: JWT-based authentication for secure access.
- **Role-Based Access Control**: Different features are accessible based on the user's role (e.g., employee vs. spectator).
