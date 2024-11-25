
// As a race driver, I want to know which car I am assigned to, so that I can see my individual lap times.
// Race drivers must be able to see a list of drivers for the next race session, as well as what cars they are assigned to drive.

// when race mode changes to "danger" ->
// The Next Race screen now displays the current session's drivers,
// and displays an extra message to tell them to proceed to the paddock.

// when race mode changes to "safe" ->
// The Next Race screen switches to the subsequent race session.
import React, { useState, useEffect } from "react";
import socket from "../../socket.js";

function NextRace() {
    const [timeRemaining, setTimeRemaining] = useState(0);

    useEffect(() => {
        // Listen for timer updates
        const handleTimerUpdate = (data) => {
            if (data.raceName === "nextRace") {
                setTimeRemaining(data.timeRemaining);
            }
        };

        socket.on("timerUpdate", handleTimerUpdate);

        return () => {
            socket.off("timerUpdate", handleTimerUpdate);
        };
    }, []);

    const startTimer = () => {
        socket.emit("startTimer", "nextRace");
    };

    const pauseTimer = () => {
        socket.emit("pauseTimer", "nextRace");
    };

    const resetTimer = () => {
        socket.emit("resetTimer", "nextRace");
    };


    return (
        <div>
            <div>
                <h1>Next Race Timer</h1>
                <h3>Time Remaining: {timeRemaining}</h3>
                <button onClick={startTimer}>Start Timer</button>
                <button onClick={pauseTimer}>Pause Timer</button>
                <button onClick={resetTimer}>Reset Timer</button>
            </div>
            <div
                style={{display: "flex", flexDirection: "column"}}>
                <p>You car:</p>
                <p>You lap times: </p>
            </div>
        </div>


    )
}

export default NextRace;
