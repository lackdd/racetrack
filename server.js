//Import stuff and technical stuff
const express = require('express');
const { createServer } = require('node:http');
const { Server } = require('socket.io');
require('dotenv').config({ path: './keys.env' });
const cors = require('cors'); // To handle CORS for frontend-backend communication

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
});

//Login


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});
