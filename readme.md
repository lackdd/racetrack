# Beachside Racetrack - Real-Time Race Management System

## Overview

The Beachside Racetrack system is designed to manage races in real time, ensuring smooth operation and providing up-to-date information for employees, race drivers, and spectators. Built using **Node.js**, **React**, and **Socket.IO**, it supports multiple personas and features dynamic race management interfaces.

---

## How to Start the Server

### Prerequisites
1. Install **[Node.js](https://nodejs.org/en/download)** (>= v14.x)
2. Install **[npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)** (Node Package Manager)
2. Environment variables set in a `.env` file (see below).

### Setup Instructions
1. Clone this repository:
   ```bash
   git clone https://gitea.kood.tech/andreberezin/racetrack.git
   cd racetrack
   ```

2. Install dependencies:
   ```bash
   npm run install-all
   ```

3. Create a `.env` file at the root of the project with the following variables:
   ```env
   PORT=<port_number>
   SAFETY_OF=<safety_official_key>
   LAP_LINE_OBS=<lap_line_observer_key>
   RECEPTIONIST=<receptionist_key>
   DEV=<developer_mode_key>
   ```
   
4. Ngrok setup (OPTIONAL)
### Ngrok Setup Guide

#### What is Ngrok?
Ngrok is a tool that creates secure tunnels to localhost, allowing your local server to be accessible via a public URL. It is especially useful for testing webhooks or sharing your local development server with team members.

---

#### Step 1: Install Ngrok

1. **Download Ngrok**:
    - Visit the [official Ngrok website](https://ngrok.com/download) and download the version suitable for your operating system.

2. **Install Ngrok**:
    - Extract the downloaded file and move it to a directory in your system's `PATH`.
    - Test the installation:
      ```bash
      ngrok --version
      ```
    - You should see the installed version printed in your terminal.

---

#### Step 2: Create an Ngrok Account and Set Up Authtoken

1. **Sign Up for an Ngrok Account**:
    - Go to the [Ngrok sign-up page](https://dashboard.ngrok.com/signup) and create an account.

2. **Retrieve Your Authtoken**:
    - After logging in, navigate to your [dashboard](https://dashboard.ngrok.com/get-started/your-authtoken) and copy your unique authtoken.

3. **Set Up Authtoken**:
    - Run the following command in your terminal:
      ```bash
      ngrok config add-authtoken <your-authtoken>
      ```
    - Replace `<your-authtoken>` with the token from your Ngrok dashboard.

---

#### Step 3: Configure Ngrok for Your Racetrack Application

1. **Edit the `.ngrok.yml` Configuration File**:
    - In the root directory of your project, edit the file named `.ngrok.yml`. Replace the authtoken with your unique authtoken. 


5.Start the server:
   - Development Mode (default 1-minute races):
     ```bash
     npm run dev
     ```
   - Production Mode (default 10-minute races):
     ```bash
     npm start
     ```
     
   - Copy the provided ngrok url form your terminal into your browser. You will see the ngrok warning page where you can press "visit site".

---

## User Guide

### Interfaces and Routes

| Interface            | Persona           | Route               |
|----------------------|-------------------|---------------------|
| **Front Desk**       | Receptionist      | `/front-desk`       |
| **Race Settings**    | Receptionist      | `/race-settings`    |
| **Race Control**     | Safety Official   | `/race-control`     |
| **Lap Line Tracker** | Lap-Line Observer | `/lap-line-tracker` |
| **Leader Board**     | Spectator         | `/leader-board`     |
| **Next Race**        | Race Driver       | `/next-race`        |
| **Race Countdown**   | Race Driver       | `/race-countdown`   |
| **Race Flags**       | Race Driver       | `/race-flags`       |

---

### Logging in
- Navigate to `/login`
- Choose the desired role and enter the password which you set in the `.env` file.
- To access all the routes, choose the `Developer` role.

### Configuring a Race (Receptionist - Front Desk)

1. **Edit race duration** (Optional): Navigate to `/race-settings`. Enter a new race duration number in minutes.
2. **Add a Race**: Navigate to `/front-desk`. Enter a unique race name and click **Add Race**.
3. **Manage Drivers**: Click on a race name to configure drivers. Add drivers by entering a unique name and car number.
4. **Edit/Delete Drivers**: Modify driver names or remove them using the **Edit** and **Delete** buttons.

---

### Starting and Managing a Race (Safety Official - Race Control)

1. Navigate to `/race-control`. View the **Next Race** or active race.
2. Start the race using the **Start Race** button. Manage race modes (Safe, Hazard, Danger, Finish) using corresponding buttons.
3. End the race session by clicking **End Session** after the race timer finishes or after choosing the Finish race mode.

---

### Observing Lap Times (Lap-Line Observer)

1. Go to `/lap-line-tracker`. Click on car numbers when they cross the lap line.
2. Lap times are recorded and displayed in real time. Race sessions automatically disable buttons after the race ends.

---

### Viewing Public Interfaces 

1. **Leaderboard**: `/leader-board` shows real-time rankings based on fastest lap times.
2. **Next Race**: `/next-race` displays the upcoming race session and assigned cars.
3. **Flag**: `/race-flags` displays the current race flag status.
4. **Race Countdown**: `/race-countdown` shows the timer for current race.
5. **Homepage**: `/` combines `/race-countdown`, `/leader-board` and `/race-flags` into one interface if any races have been entered. Functions as a welcome screen if no races have been entered.

---

## Technical Features

- **Real-Time Communication**: Powered by **Socket.IO**, ensuring instant updates across all interfaces.
- **Persistent Data**: Race sessions, lap times, and configurations are saved in a **MongoDB Atlas** database.
- **Dynamic Role-Based Interfaces**: Custom routes and controls based on user roles (e.g., employee vs. spectator).
- **Responsive Design**: Optimized for various screen sizes, from tablets to large public displays. Hamburger style navigation bar for smaller screens.
- **Light and dark mode UI**: Toggle between light and dark mode by clicking the sun or moon icon in the navigation bar.
- **Full screen mode**: Switch to full screen mode by clicking the full screen icon in the navigation bar. Exit full screen mode by pressing the escape key.

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

### General Tools
- ![Ngrok](https://img.shields.io/badge/Ngrok-5.0.0--beta.2-lightgrey)


For any issues or feature requests, please open an issue on [GitHub](https://github.com/your-repo/beachside-racetrack).

