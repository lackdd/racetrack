//Import stuff and technical stuff
const express = require('express');
const { createServer } = require('node:http');
const { Server } = require('socket.io');
require('dotenv').config({ path: './keys.env' });
const cors = require('cors'); // To handle CORS for frontend-backend communication
const Timer = require('./timer.js');

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "https://intimate-upright-sunfish.ngrok-free.app"], // Replace with your frontend URL

        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],       // Allowed HTTP methods
    },
});


app.use(cors());
app.use(express.json());

let raceData = [];
let flagStatus = "";

const timer = new Timer();

// Initialize "nextRace" timer
timer.initializeTimer("nextRace");

// Handle socket connections
io.on('connection', (socket) => {
    console.log('Client connected');

    // Initialize timers for all races
    raceData.forEach((race) => {
        timer.initializeTimer(race.raceName);
    });

    // Handle timer commands
    socket.on('startTimer', (raceName) => {
        timer.startTimer(raceName, io, raceData);

        const race = raceData.find(r => r.raceName === raceName);
        if (race) {
            // Update the appropriate timer field
            if (raceName === "nextRace") {
                race.timeRemainingNextRace = timer.getTimeRemaining(raceName);
            } else {
                race.timeRemainingOngoingRace = timer.getTimeRemaining(raceName);
                race.isOngoing = true; // Mark the race as ongoing
            }
            io.emit("raceData", raceData); // Broadcast updated race data to all clients
        }
    });

    socket.on('pauseTimer', (raceName) => {
        timer.pauseTimer(raceName);
    });

    socket.on('resetTimer', (raceName) => {
        timer.resetTimer(raceName, io);
    });

    socket.on('getTimeRemaining', (raceName, callback) => {
        const timeRemaining = timer.getTimeRemaining(raceName);
        callback({ raceName, timeRemaining });
    });

    // immediately send current race data to the newly connected client
    socket.emit("raceData", raceData);

    socket.on("createRace", (newRace) => {
        raceData.push({ raceName: newRace.raceName, isOngoing: newRace.isOngoing, drivers: [], timeRemainingOngoingRace: 0, timeRemainingNextRace: 0, });
        timer.initializeTimer(newRace.raceName); // Initialize timer for the new race
        io.emit("raceData", raceData); // Broadcast updated race data to all clients
    });

    socket.on("updateRaceStatus", ({ raceName, isOngoing }) => {
        const race = raceData.find((race) => race.raceName === raceName);
        if (race) {
            race.isOngoing = isOngoing; // Update the `isOngoing` status
        }
        io.emit("raceData", raceData); // Broadcast updated race data to all clients
    });

    socket.on("updateTimerValue", ({ raceName, timeRemaining }) => {
        const race = raceData.find((race) => race.raceName === raceName);
        if (race) {
            race.timeRemaining = timeRemaining; // Update timer value on the server
        }
        io.emit("raceData", raceData); // Broadcast updated race data to all clients
    });

    socket.on("deleteRace", (raceName) => {
        raceData = raceData.filter((race) => race.raceName !== raceName);
        io.emit("raceData", raceData); // Broadcast updated race data to all clients
    });

    socket.on("updateRaceDrivers", ({ raceName, drivers }) => {
        const race = raceData.find((race) => race.raceName === raceName);
        if (race) {
            race.drivers = drivers; // Update drivers for the specified race
        }
        io.emit("raceData", raceData); // Broadcast updated race data
        io.emit('dataToSpectator', Array.from(raceData.entries()));
    });

    // Send current race data to newly connected clients
    socket.on('getRaceData', () => {
        socket.emit('raceData', raceData);
    });
    socket.on('getDataForSpectator', () => {
        socket.emit('dataToSpectator', Array.from(raceData.entries()));
    })

    //Handle flag status here
    socket.on('flagButtonWasClicked', (data) => {
        flagStatus = data;
        io.emit('broadcastFlagButtonChange', flagStatus);
    });

    socket.on('FlagPageConnected', () => {
        socket.emit('currentFlagStatus', flagStatus);
    })


});


//Login
const safetyOfficialKey = process.env.SAFETY_OF;
const lapLineKey = process.env.LAP_LINE_OBS;
const receptionistKey = process.env.RECEPTIONIST;
const raceDriverKey = process.env.RACE_DRIVER;

app.post('/api/login', (req, res) => {
    const { role, password } = req.body; // Destructure the received data
    if (role === "Safety official" && password === safetyOfficialKey) {
        res.json({ message: 'Correct password', role });
    } else if (role === "Lap line obs" && password === lapLineKey){
        res.json({ message: 'Correct password', role });
    } else if (role === "Receptionist" && password === receptionistKey) {
        res.json({ message: 'Correct password', role });
    } else if (role === "Racer" && password === raceDriverKey) {
        res.json({ message: 'Correct password', role });
    } else {
        res.status(401).json({ message: 'Invalid password' });
    }
});


//Create PORT
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});
