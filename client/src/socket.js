// socket.js
import { io } from "socket.io-client";

// Initialize the Socket.IO client
const socket = io("http://localhost:5173", {
    transports: ['websocket'], // Use WebSocket transport
    //forceNew: true,             // Force new connection
    reconnection: true, // Enable automatic reconnection
    reconnectionAttempts: 5, // Number of reconnection attempts
    reconnectionDelay: 1000, // Delay between reconnection attempts
});

export default socket; // Export the socket instance
