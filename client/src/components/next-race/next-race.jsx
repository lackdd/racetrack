// As a race driver, I want to know which car I am assigned to, so that I can see my individual lap times.
// Race drivers must be able to see a list of drivers for the next race session, as well as what cars they are assigned to drive.

// when race mode changes to "danger" ->
// The Next Race screen now displays the current session's drivers,
// and displays an extra message to tell them to proceed to the paddock.

// when race mode changes to "safe" ->
// The Next Race screen switches to the subsequent race session.
import React, { useState, useEffect } from "react";
import socket from "../../socket.js";

function formatLapTime(milliseconds) {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const millisecondsRemainder = (milliseconds % 1000) / 10;

    return {
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0'),
        milliseconds: millisecondsRemainder.toString().padStart(2, '0')
    };
} // todo võiks saada täpsema timeri

function NextRace() {
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [raceMode, setRaceMode] = useState("");
    const [raceData, setRaceData] = useState([]);
    const [currentRaceData, setCurrentRaceData] = useState([]); // Store all races and their drivers
    const [nextRaceData, setNextRaceData] = useState([]); // Store all races and their drivers


    // Handle incoming flag changes (race modes)
    useEffect(() => {
        socket.emit("flagButtonWasClicked");

        socket.on("broadcastFlagButtonChange", (newFlagStatus) => {
            if (newFlagStatus === "danger") { // display current race's drivers and an extra message to proceed to the paddock
                setRaceMode("danger");
            }
            if (newFlagStatus === "start" || newFlagStatus === "safe") { // display subsequent race session
                setRaceMode("safe");
            }
            console.log("Getting flag status from server")
        });

        // Clean up the socket listener on unmount
        return () => {
            socket.off("broadcastFlagButtonChange");
        };
    }, []);

    // get the timer data from the server
    useEffect(() => {
        socket.emit("getCurrentRaceTimer")

        socket.on("currentRaceTimer", (data) => {
            if (data !== null) {
                setTimeRemaining(data);
            } else {
                setTimeRemaining(0);
                console.error("Error updating timer. Resetting...");
            }
        });

        // Clean up the socket listener on unmount
        return () => {
            socket.off("currentRaceTimer");
        };
    }, [raceMode]);

    useEffect(() => {
        socket.emit("getQueuePosition")
        socket.on("queuePosition", queuePosition => {
            console.log("Queue position received: ", queuePosition);
            // if queuePosition = -1 then all races are finished
            setCurrentRaceData(raceData[queuePosition]);
            setNextRaceData(raceData[queuePosition+1]);
        });

        // Clean up the socket listener on unmount
        return () => {
            socket.off("queuePosition");
        };

    },[raceData]);

    useEffect(() => {
        console.log("Current race data: " + currentRaceData);
        console.log("Next race data: " + nextRaceData);
    }, [currentRaceData, nextRaceData]);

    // Fetch race data
    useEffect(() => {
        // if (raceStarted) {
        socket.emit("getRaceData");

        socket.on("raceData", (data) => {
            console.log("New data fetched");
            setRaceData(data);
        });

        // Clean up the socket listener on unmount
        return () => {
            socket.off("raceData");
        };
        // } else {
        //     console.log("Race is not started or has finished.");
        // }
    }, [raceMode]);




    //
    // useEffect(() => {
    //     // Listen for timer updates
    //     const handleTimerUpdate = (data) => {
    //         if (data.raceName === "nextRace") {
    //             setTimeRemaining(data.timeRemaining);
    //         }
    //     };
    //
    //     socket.on("timerUpdate", handleTimerUpdate);
    //
    //     return () => {
    //         socket.off("timerUpdate", handleTimerUpdate);
    //     };
    // }, []);
    //
    // const startTimer = () => {
    //     socket.emit("startTimer", "nextRace");
    // };
    //
    // const pauseTimer = () => {
    //     socket.emit("pauseTimer", "nextRace");
    // };
    //
    // const resetTimer = () => {
    //     socket.emit("resetTimer", "nextRace");
    // };

    const time = formatLapTime(timeRemaining);

    return (
        <div>
            <div>
                <h1>Next Race</h1>
                <h3>Time Remaining:
                    {timeRemaining === 0 ? (
                        <p style={{ color: "black" }}>00:00:00</p>
                    ) : (
                        <p style={{display: "flex"}}>
                            <span style={{width: "2ch"}}>{time.minutes}</span>:
                            <span style={{width: "2ch"}}>{time.seconds}</span>:
                            <span style={{width: "2ch"}}>{time.milliseconds}</span>
                        </p>
                    )}
                </h3>
                {/*<button onClick={startTimer}>Start Timer</button>*/}
                {/*<button onClick={pauseTimer}>Pause Timer</button>*/}
                {/*<button onClick={resetTimer}>Reset Timer</button>*/}
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
