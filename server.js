//Import stuff and technical stuff
const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const path = require('path');
const app = express();
const server = createServer(app);
const io = new Server(server);


// Middleware to add the ngrok-skip-browser-warning header
app.use((req, res, next) => {
    res.setHeader('ngrok-skip-browser-warning', '1');
    next();
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
