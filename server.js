//Import stuff and technical stuff
const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
require('dotenv').config({ path: './keys.env' });
const cors = require('cors'); // To handle CORS for frontend-backend communication

const path = require('path');
const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Replace with your frontend URL
        methods: ["GET", "POST"],       // Allowed HTTP methods
    },
});


app.use(cors());
app.use(express.json());

// Log request headers and body
app.use((req, res, next) => {
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    next();
});

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

//Reactile
app.get('/api/message', (req, res) => {
    console.log('API endpoint called');
    res.json({ message: 'Hello from the backend!' });
});

// POST route to handle data from React
app.post('/api/data', (req, res) => {
    const receivedData = req.body;
    console.log('Data received from client:', receivedData);
    res.json({ message: 'Data received successfully', data: receivedData });
});

// Handle POST request
app.post('/api/send-data', (req, res) => {
    const { name } = req.body; // Get the "name" field from the request body
    console.log('Received name:', name);
    res.json({ message: `Hello, ${name}!` }); // Send a response back
});

// Handle socket connections
io.on('connection', (socket) => {
    console.log('Client connected');

    //const raceDriversMap = new Map(raceDriversData); // Convert to Map if needed

    // Listen for the 'updateRaceDrivers' event from the client
    socket.on('updateRaceDrivers', (data) => {
        console.log('Received race drivers data from client:', data);

        // broadcast data to all clients
        io.emit('raceDriversData', data);
    });

    // Listen for button press event from receptionist page
    socket.on('myButtonPressed', () => {
        // Broadcast to all clients (including index.html)
        io.emit('buttonPressedNotification');
    });
});

//Login


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});
