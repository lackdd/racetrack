//Import stuff and technical stuff
const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const store = require('./stores/store.js');

const path = require('path');
const app = express();
const server = createServer(app);
const io = new Server(server);


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

io.on('connection', (socket) => {
    console.log('a user connected');
});

app.get('/front-desk', (req, res) => {
    res.sendFile(path.join(__dirname, 'components', 'front-desk.html'));
});

app.get('/race-control', (req, res) => {
    res.sendFile(path.join(__dirname, 'components', 'race-control.html'));
});

//
app.get('/spectator', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/src/guest/spectator', 'spectator.html'));
})
// Handle socket connections
io.on('connection', (socket) => {

    // Listen for button press event from receptionist page
    socket.on('myButtonPressed', () => {
        // Broadcast to all clients (including index.html)
        io.emit('buttonPressedNotification');
    });
});


server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
});
