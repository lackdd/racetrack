//Import stuff and technical stuff
const express = require('express');
const { createServer } = require('node:http');
const { Server } = require('socket.io');
require('dotenv').config({ path: './keys.env' });
const cors = require('cors'); // To handle CORS for frontend-backend communication
const Timer = require('./timer.js');
const Stopwatch = require('./stopwatch.js');

const app = express();
const server = createServer(app);
const io = new Server(server, {
    transports: ['websocket'], // forces websocket only, no polling
    //forceNew: true,             // Force new connection
    cors: {
        origin: ["http://localhost:5173", "https://intimate-upright-sunfish.ngrok-free.app"], // Replace with your frontend URL

        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],       // Allowed HTTP methods
    },
});


app.use(cors());
app.use(express.json());

let raceData = [];

let queuePosition = -1;

let areAllRacesFinished = true;
let flagStatus = "";

const timer = new Timer();
const stopwatch = new Stopwatch();

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
                //race.isOngoing = true; // Mark the race as ongoing
            }
            io.emit("raceData", raceData); // Broadcast updated race data to all clients
        }
    });

    socket.on('pauseTimer', (raceName) => {
        timer.pauseTimer(raceName);
    });

    // vist pole vaja
    /*socket.on('continueTimer', (raceName) => {
        timer.continueTimer(raceName);
    });*/

    socket.on('resetTimer', (raceName) => {
        timer.resetTimer(raceName, io);
    });

    socket.on('getTimeRemaining', (raceName, callback) => {
        const timeRemaining = timer.getTimeRemaining(raceName);
        callback({ raceName, timeRemaining });
    });

    // immediately send current race data to the newly connected client
    socket.emit("raceData", raceData);
    socket.emit("queuePosition", queuePosition);
    socket.emit('areAllRacesFinished', areAllRacesFinished);

    socket.on("createRace", (newRace) => {
        console.log("Current value of areAllRacesFinished:", areAllRacesFinished);
        raceData.push({ raceName: newRace.raceName, isOngoing: newRace.isOngoing, drivers: [], timeRemainingOngoingRace: 0, timeRemainingNextRace: 0 });
        timer.initializeTimer(newRace.raceName); // Initialize timer for the new race
        io.emit("raceData", raceData); // Broadcast updated race data to all clients
        console.log("here");

        if (areAllRacesFinished === true) {

            queuePosition = raceData.length-1;

            areAllRacesFinished = false;

            console.log("areAllRacesFinished value: ", areAllRacesFinished);

            io.emit("areAllRacesFinished", areAllRacesFinished);

            io.emit('queuePosition', queuePosition);

        }
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
        queuePosition = raceData.length-1;
        io.emit('queuePosition', queuePosition);
    });

    socket.on("updateRaceDrivers", ({ raceName, drivers }) => {
        const race = raceData.find((race) => race.raceName === raceName);
        console.log("i got new race driver data");
        if (race) {
            race.drivers = drivers; // Update drivers for the specified race
        }
        console.log(raceData);
        io.emit("raceData", raceData); // Broadcast updated race data
        io.emit('dataToSpectator', Array.from(raceData.entries()));
    });

    // Send current race data to newly connected clients
    socket.on('getRaceData', () => {
        socket.emit('raceData', raceData);
        //socket.emit("queuePosition", queuePosition);
    });

    socket.on('sendRaceData', () => {
        socket.emit('sendRaceData', raceData);
        //socket.emit("queuePosition", queuePosition);
    });

    // Send current race data to newly connected clients
    socket.on('getQueuePosition', () => {
        socket.emit("queuePosition", queuePosition);
    });

    socket.on('getAreAllRacesFinished', () => {
        socket.emit("areAllRacesFinished", areAllRacesFinished);

    });

    socket.on('updateQueuePosition', (position) => {
        queuePosition = position;
        io.emit('queuePosition', queuePosition);
    });

    socket.on('updateAreAllRacesFinished', (data) => {
        areAllRacesFinished = data;
        io.emit('areAllRacesFinished', areAllRacesFinished);
    });

    socket.on('getDataForSpectator', () => {
        socket.emit('dataToSpectator', Array.from(raceData.entries()));
    });

    //Handle flag status here
    socket.on('flagButtonWasClicked', (data) => {
        if (data !== undefined) {
            flagStatus = data;
        }
        if (data === "start") {
            flagStatus = "safe";
        }
        //console.log("flag status on server: " + flagStatus);
        io.emit('broadcastFlagButtonChange', flagStatus);
    });

    socket.on('FlagPageConnected', () => {
        socket.emit('currentFlagStatus', flagStatus);
    });

    // handle socket for /countdown to get the current race timeRemainingOngoingRace value
    let timerIntervalId = null; // Variable to store the interval ID

    socket.on('getCurrentRaceTimer', () => {
        if (timerIntervalId) {
            clearInterval(timerIntervalId); // Clear any existing interval
        }

        timerIntervalId = setInterval(() => {
            const onGoingRace = raceData.filter((race) => race.isOngoing === true);
            if (onGoingRace.length > 0) {
                const timer = onGoingRace[0].timeRemainingOngoingRace;
                socket.emit('currentRaceTimer', timer);
            } else {
                // No ongoing race, clear the interval and emit null once
                clearInterval(timerIntervalId);
                timerIntervalId = null; // Reset the interval ID
                socket.emit('currentRaceTimer', null);
            }
        }, 10); // Emit the timer every 10 milliseconds
    });

    // Handle stopwatch sockets
    socket.on('initializeStopwatch', (driverName) => {
        stopwatch.initializeStopwatch(driverName);
    });

    socket.on('startStopwatch', (driverName) => {
        stopwatch.startStopwatch(driverName);
    });

    socket.on('resetStopwatch', (driverName) => {
        stopwatch.initializeStopwatch(driverName);
        stopwatch.resetStopwatch(driverName);
    });

    socket.on('stopStopwatch', (raceDrivers) => {
        stopwatch.stopStopwatch(raceDrivers);
    });

    socket.on('getCurrentLapTimes', () => {
        socket.emit("currentLapTimes", stopwatch.getCurrentLapTimes());
    });


    let stopwatchesIntervalId = null; // Variable to store the interval ID

    socket.on('getCurrentLapTimesInRealTime', () => {
        if (stopwatchesIntervalId) {
            clearInterval(stopwatchesIntervalId); // Clear any existing interval
        }

        stopwatchesIntervalId = setInterval(() => {
            const onGoingRace = raceData.filter((race) => race.isOngoing === true);
            if (onGoingRace.length > 0) {
                socket.emit('currentLapTimesInRealTime', stopwatch.getCurrentLapTimes());
            } else {
                // No ongoing race, clear the interval and emit null once
                clearInterval(stopwatchesIntervalId);
                stopwatchesIntervalId = null; // Reset the interval ID
                socket.emit('currentLapTimesInRealTime', null);
            }
        }, 10); // Emit the timer every 10 milliseconds
    });

});


//Login
const safetyOfficialKey = process.env.SAFETY_OF;
const lapLineKey = process.env.LAP_LINE_OBS;
const receptionistKey = process.env.RECEPTIONIST;
const raceDriverKey = process.env.RACE_DRIVER;

app.post('/api/login', (req, res) => {
    const { role, password } = req.body; // Destructure the received data
    console.log(role + "is trying to log in with password: " + password);
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
