//Import stuff and technical stuff
const express = require('express');
const {createServer} = require('node:http');
const {Server} = require('socket.io');
require('dotenv').config({path: './keys.env'});
const cors = require('cors'); // To handle CORS for frontend-backend communication
const Timer = require('./timer.js');
const Stopwatch = require('./stopwatch.js');
const keys = require('./config/keys');
const mongoose = require('mongoose');
const Race = require('./models/Race');
const LastRaceData = require('./models/LastRaceData');
const Variable = require('./models/Variable');
mongoose.connect(keys.mongoURI);

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
let raceMode = "";
let lastAssignedCar = 0;
let lastRaceData = [];
let areAllRacesFinished = true;
let flagStatus = "";
const timer = new Timer();
const stopwatch = new Stopwatch();

// Load existing races from MongoDB into memory
(async () => {
    try {
        raceData = await Race.find(); // Fetch races from MongoDB
        raceData.forEach((race) => {
            timer.initializeTimer(race.raceName, race.timeRemainingOngoingRace || 60000);
        });
        console.log("Races and timers initialized from database:", raceData);
        lastRaceData = await LastRaceData.find(); // Fetch races from MongoDB
        let queuePositionVar = await Variable.findOne({key: "queuePosition"});
        if (!queuePositionVar) {
            queuePositionVar = await Variable.create({key: "queuePosition", value: -1});
        }
        let raceModeVar = await Variable.findOne({key: "raceMode"});
        if (!raceModeVar) {
            raceModeVar = await Variable.create({key: "raceMode", value: ""});
        }
        let lastAssignedCarVar = await Variable.findOne({key: "lastAssignedCar"});
        if (!lastAssignedCarVar) {
            lastAssignedCarVar = await Variable.create({key: "lastAssignedCar", value: 0});
        }
        let areAllRacesFinishedVar = await Variable.findOne({key: "areAllRacesFinished"});
        if (!areAllRacesFinishedVar) {
            areAllRacesFinishedVar = await Variable.create({key: "areAllRacesFinished", value: true});
        }
        let flagStatusVar = await Variable.findOne({key: "flagStatus"});
        if (!flagStatusVar) {
            flagStatusVar = await Variable.create({key: "flagStatus", value: ""});
        }
        queuePosition = queuePositionVar.value;
        raceMode = raceModeVar.value;
        lastAssignedCar = lastAssignedCarVar.value;
        areAllRacesFinished = areAllRacesFinishedVar.value;
        flagStatus = flagStatusVar.value;
        io.emit("areAllRacesFinished", areAllRacesFinished);
        io.emit('queuePosition', queuePosition);

        // Automatically start timers if raceMode is "safe"
        if (raceMode === "safe") {

            raceData.forEach((race) => {
                if (!race.isOngoing) return;
                timer.startTimer(race.raceName, io, raceData);
            });
        }

        timer.initializeTimer("nextRace");
    } catch (error) {
        console.error("Error loading races from database:", error);
    }
})();

// save variables to database on program exit
const saveVariable = async (key, value) => {
    try {
        const updatedVariable = await Variable.findOneAndUpdate(
            {key},               // Search by key
            {value},             // Update the value
            {upsert: true, new: true, setDefaultsOnInsert: true,} // Options
        );
    } catch (error) {
        console.error("Error saving variable:", error);
    }
};

// Handle socket connections
io.on('connection', (socket) => {
    console.log('Client connected');

    // Initialize timers for all races
    raceData.forEach((race) => {
        timer.initializeTimer(race.raceName);
    });

    // Handle timer commands
    function startTimer(raceName) {
        timer.startTimer(raceName, io, raceData);

        const race = raceData.find(r => r.raceName === raceName);
        if (race) {
            // Update the appropriate timer field
            if (raceName === "nextRace") {
                race.timeRemainingNextRace = timer.getTimeRemaining(raceName);
            } else {
                race.timeRemainingOngoingRace = timer.getTimeRemaining(raceName);
            }
            io.emit("raceData", raceData); // Broadcast updated race data to all clients
        }
    }


    socket.on('pauseTimer', (raceName) => {
        timer.pauseTimer(raceName);
    });

    socket.on('resetTimer', (raceName) => {
        timer.resetTimer(raceName, io);
    });

    socket.on('getTimeRemaining', (raceName, callback) => {
        const timeRemaining = timer.getTimeRemaining(raceName);
        callback({raceName, timeRemaining});
    });


    // socket.on('getTimeRemaining', (raceName) => {
    //
    //     if (!timer.intervals) {
    //         timer.intervals = {};
    //     }
    //
    //     // Clear any existing interval for the same raceName to prevent duplicates
    //     if (timer.intervals[raceName]) {
    //         clearInterval(timer.intervals[raceName]);
    //     }
    //
    //     // Start a new interval
    //     timer.intervals[raceName] = setInterval(() => {
    //         const timeRemaining = timer.getTimeRemaining(raceName);
    //
    //         // Broadcast updated time to the client
    //         socket.emit('timeRemaining', { raceName, timeRemaining });
    //
    //         // Stop the interval when timeRemaining reaches 0
    //         if (timeRemaining <= 0) {
    //             clearInterval(timer.intervals[raceName]);
    //             delete timer.intervals[raceName];
    //         }
    //     }, 10);
    // });

    // immediately send current race data to the newly connected client
    socket.emit("raceData", raceData);
    socket.emit("queuePosition", queuePosition);
    socket.emit('areAllRacesFinished', areAllRacesFinished);

    socket.on("updateLastRaceData", async (newRace) => {
        try {
            // Use a fixed key or condition to always update the same document
            const query = {}; // Empty query matches the first document found (or create a new one)

            const updatedRace = await LastRaceData.findOneAndUpdate(
                query, // Always updates the first or only document
                {
                    raceName: newRace.raceName, // Update raceName to the new race's name
                    isOngoing: newRace.isOngoing || false,
                    drivers: newRace.drivers || [],
                    timeRemainingOngoingRace: newRace.timeRemainingOngoingRace || 0,
                    timeRemainingNextRace: newRace.timeRemainingNextRace || 0,
                },
                {upsert: true, new: true, setDefaultsOnInsert: true} // Upsert ensures document creation
            );

            io.emit("lastRaceData", [updatedRace]);
        } catch (error) {
            console.error("Error updating LastRaceData:", error);
        }
    });

    socket.on("createRace", async (newRace) => {
        try {
            const race = new Race({
                raceName: newRace.raceName,
                isOngoing: newRace.isOngoing || false,
                drivers: newRace.drivers || [],
            });

            await race.save(); // Save the race to MongoDB
            raceData.push(race); // Add to in-memory data for existing clients
            timer.initializeTimer(race.raceName); // Initialize timer for the new race
            io.emit("raceData", raceData); // Broadcast updated race data to all clients

            if (areAllRacesFinished === true) {
                queuePosition = raceData.length - 1;
                areAllRacesFinished = false;
                saveVariable("queuePosition", queuePosition);
                saveVariable("areAllRacesFinished", areAllRacesFinished);
                io.emit("areAllRacesFinished", areAllRacesFinished);
                io.emit('queuePosition', queuePosition);
            }
        } catch (error) {
            console.error("Error creating race:", error);
        }
    });

    async function updateRaceStatus({raceName, isOngoing}) {
        const race = raceData.find((race) => race.raceName === raceName);
        if (race) {
            race.isOngoing = isOngoing;
        }
        const updatedRace = await Race.findOneAndUpdate(
            {raceName},
            {isOngoing},
            {new: true}
        );
        if (!updatedRace) {
            console.error("Couldnt find race in database");
            return;
        }
        io.emit("raceData", raceData);
    };

    socket.on("updateRaceStatus", ({raceName, isOngoing}) => {
        updateRaceStatus({raceName, isOngoing});
    });

    function updateTimer({raceName, timeRemaining}) {
        const race = raceData.find((race) => race.raceName === raceName);
        if (race) {
            race.timeRemaining = timeRemaining; // Update timer value on the server
            if (race.timeRemaining === 0) {
                updateRaceMode("finish", race.raceName);
            }
        }
        io.emit("raceData", raceData);
    };

    timer.setUpdateTimerFunction(updateTimer);

    socket.on("deleteRace", async (raceName) => {
        try {
            const race = raceData.find((race) => race.raceName === raceName);
            if (race) {
                await Race.findByIdAndDelete(race._id); // Delete from MongoDB
                raceData = raceData.filter((r) => r.raceName !== raceName); // Remove from memory
                io.emit("raceData", raceData);
            }
        } catch (error) {
            console.error("Error deleting race:", error);
        }
        io.emit('queuePosition', queuePosition);
        if (queuePosition === -1 || raceData.length < 1) {
            areAllRacesFinished = true;
            saveVariable("areAllRacesFinished", areAllRacesFinished);
            io.emit('areAllRacesFinished', areAllRacesFinished);
        }
    });

    socket.on("updateRaceDrivers", async ({raceName, drivers}) => {
        try {
            console.log(drivers)
            const race = await Race.findOne({raceName});
            if (race) {
                race.set("drivers", drivers);
                await race.save();
            }
            // reload raceData from database
            raceData = await Race.find();
            io.emit("raceData", raceData);
        } catch (error) {
            console.error("error updating race drivers", error.message);
            console.error(error.stack);
        }
    });

    // Send current race data to newly connected clients
    socket.on('getRaceData', () => {
        socket.emit('raceData', raceData);
    });

    socket.on('updateRaceData', (data) => {
        raceData = data;
        io.emit('raceData', raceData);
    });

    // Send current race data to newly connected clients
    socket.on('getQueuePosition', () => {
        socket.emit("queuePosition", queuePosition);
    });

    socket.on('getLastRaceData', () => {
        socket.emit("lastRaceData", lastRaceData);
    });

    socket.on('updateLastRaceData', (data) => {
        lastRaceData = data;
        io.emit('lastRaceData', lastRaceData);
    });

    socket.on('getLastAssignedCar', () => {
        socket.emit("lastAssignedCar", lastAssignedCar);
    });

    socket.on('getRaceMode', () => {
        socket.emit("raceMode", raceMode);
    });

    socket.on('getTimerUpdate', () => {
        socket.emit("timer", raceMode);
    });

    socket.on('getAreAllRacesFinished', () => {
        socket.emit("areAllRacesFinished", areAllRacesFinished);

    });

    socket.on('updateLastAssignedCar', (data) => {
        lastAssignedCar = data;
        io.emit('lastAssignedCar', lastAssignedCar);
        saveVariable("lastAssignedCar", lastAssignedCar);
    });

    socket.on('updateQueuePosition', (position) => {
        queuePosition = position;
        io.emit('queuePosition', queuePosition);
        saveVariable("queuePosition", queuePosition);
    });

    function updateRaceMode(mode, raceName) {
        raceMode = mode;
        io.emit('raceMode', raceMode);

        // Save the updated raceMode to the database
        saveVariable("raceMode", raceMode);

        switch (raceMode) {
            case "danger":
                timer.pauseTimer(raceName);
                console.log("danger");
                break;
            case "safe":
                startTimer(raceName);
                console.log("safe");
                break;
            case "hazard":
                console.log("hazard");
                break;
            case "finish":
                const ongoingRace = raceData.find(race => race.isOngoing === true);
                if (ongoingRace) {
                    stopwatch.clearAllStopwatches(ongoingRace.drivers);
                }
                timer.resetTimer(raceName, io);
                console.log("finish");
                break;
            default:
                break;
        }
        flagButtonWasClicked(raceMode);
    };

    socket.on('updateRaceMode', (mode, raceName) => {
        updateRaceMode(mode, raceName);
    });

    socket.on('updateAreAllRacesFinished', (data) => {
        areAllRacesFinished = data;
        io.emit('areAllRacesFinished', areAllRacesFinished);
        saveVariable("areAllRacesFinished", areAllRacesFinished);
    });


    socket.on('getDataForSpectator', () => {
        socket.emit('dataToSpectator', Array.from(raceData.entries()));
    });

    //Handle flag status here
    function flagButtonWasClicked(data) {
        if (data !== undefined) {
            flagStatus = data;
            saveVariable("flagStatus", flagStatus);
        }
        if (data === "start") {
            flagStatus = "safe";
            saveVariable("flagStatus", flagStatus);
        }
        io.emit('broadcastFlagButtonChange', flagStatus);
    };

    socket.on("flagButtonWasClicked", (data) => {
        flagButtonWasClicked(data);
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
                const currentTimer = onGoingRace[0].timeRemainingOngoingRace;
                socket.emit('currentRaceTimer', currentTimer);
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

    //Handle spectator stuff here
    socket.on('getRaceData', () => {
        socket.emit('raceDataToSpectator', raceData);

    });

    socket.on('startStopwatch', (driverName) => {
        console.log(stopwatch);
        stopwatch.startStopwatch(driverName);
    });

    socket.on('resetStopwatch', (driverName) => {
        console.log(stopwatch);
        stopwatch.initializeStopwatch(driverName);
        stopwatch.resetStopwatch(driverName);
    });

    socket.on('stopStopwatch', (raceDrivers) => {
        stopwatch.clearAllStopwatches(raceDrivers);
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
const DEV = process.env.DEV;

app.post('/api/login', (req, res) => {
    const {role, password} = req.body; // Destructure the received data
    console.log(role + "is trying to log in with password: " + password);
    if (role === "Safety official" && password === safetyOfficialKey) {
        res.json({message: 'Correct password', role});
    } else if (role === "Lap line obs" && password === lapLineKey) {
        res.json({message: 'Correct password', role});
    } else if (role === "Receptionist" && password === receptionistKey) {
        res.json({message: 'Correct password', role});
    } else if (role === "Racer" && password === raceDriverKey) {
        res.json({message: 'Correct password', role});
    } else if (role === "DEV" && password === DEV) {
        res.json({message: 'Correct password', role});

    } else {
        res.status(401).json({message: 'Invalid password'});
    }
});


//Create PORT
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});
