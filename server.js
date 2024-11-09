//Import stuff and technical stuff
const PORT = 3000;
const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const store = require('./stores/store.js');
require('dotenv').config({ path: './stores/.env' });

const path = require('path');
const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.json());


// should remove the ngrok warning page for new users
app.get('/fetch-from-ngrok', async (req, res) => {
    try {
        const fetch = (await import('node-fetch')).default; // Dynamic import
        const response = await fetch("https://intimate-upright-sunfish.ngrok-free.app/", {
            method: "GET",
            headers: {
                "ngrok-skip-browser-warning": "true"
            }
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error fetching data from ngrok");
    }
});

app.use(express.static(path.join(__dirname, 'public'))); // Serve static files
app.use(express.static(path.join(__dirname, 'components'))); // Serve static files

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/front-desk', (req, res) => {
    res.sendFile(path.join(__dirname, 'components','front-desk', 'front-desk.html'));
});

app.get('/race-control', (req, res) => {
    res.sendFile(path.join(__dirname, 'components', 'race-control', 'race-control.html'));
});

//
app.get('/spectator', (req, res) => {
    res.sendFile(path.join(__dirname, 'components', 'spectator', 'spectator.html'));
})

// Handle socket connections
io.on('connection', (socket) => {
    console.log('Client connected');

    // retrieve raceDriversMap data from store and send it to the client
    const raceDriversData = store.get('raceDriversMap');
    const raceDriversMap = new Map(raceDriversData); // Convert to Map if needed
    socket.emit('raceDriversData', Array.from(raceDriversMap.entries()));

    // Listen for the 'updateRaceDrivers' event from the client
    socket.on('updateRaceDrivers', (data) => {
        console.log('Received race drivers data from client:', data);
        // update map in the store based on client data
        const updatedRaceDriversMap = new Map(data);
        store.set('raceDriversMap', Array.from(updatedRaceDriversMap.entries()));

        // broadcast the updated map to all connected clients
        //io.emit('raceDriversData', Array.from(updatedRaceDriversMap.entries()));
    });

    // Listen for button press event from receptionist page
    socket.on('myButtonPressed', () => {
        // Broadcast to all clients (including index.html)
        io.emit('buttonPressedNotification');
    });
});

//Login
const loginRoute = require('./public/parts/login');
app.use('/login', loginRoute);



server.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});
