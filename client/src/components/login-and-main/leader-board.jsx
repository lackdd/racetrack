import { useEffect, useState, useRef } from "react";
import socket from "../../socket.js";

function LeaderBoard() {
    const [timer, setTimer] = useState(null); // Timer state

    useEffect(() => {
        function handleIncomingRaceTime(timerValue) {
            console.log("Timer received from server:", timerValue);
            setTimer(timerValue);
        }

        // Request timer data from the server
        socket.emit("getCurrentRaceTimer");

        // Listen for timer updates
        socket.on("currentRaceTimer", handleIncomingRaceTime);

        // Clean up listener on unmount
        return () => {
            socket.off("currentRaceTimer", handleIncomingRaceTime);
        };
    }, []);


    return (
        <div>
            <h2>Spectator Page</h2>
            <p>Timer: {timer}</p>
        </div>
    );
}

export default LeaderBoard;
