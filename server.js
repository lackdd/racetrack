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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});
