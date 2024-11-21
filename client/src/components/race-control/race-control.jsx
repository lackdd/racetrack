import React, { useState, useEffect } from "react";
import socket from "../../socket.js";

function RaceControl() {
    const [raceData, setRaceData] = useState([]); // Store all races and their drivers
    const [selectedRace, setSelectedRace] = useState(""); // Store the currently selected race
    const [timeRemaining, setTimeRemaining] = useState(60);
    const [timerRunning, setTimerRunning] = useState(false);
    let timerInterval;

    useEffect(() => {

        if (timerRunning) {
            timerInterval = setInterval(() => {
                setTimeRemaining((prevTime) => {
                    if (prevTime <= 0.1) {
                        clearInterval(timerInterval);
                        setTimerRunning(false);
                        console.log("Timer finished!");
                        return 0;
                    }
                    return prevTime - 0.1;
                });
            }, 100);
        }

        return () => clearInterval(timerInterval);
    }, [timerRunning]);

    const handleRaceStart = () => {
        if (!timerRunning && timeRemaining > 0) {
            setTimerRunning(true);
        }
    };
    const handleRacePause = () => {
        setTimerRunning(false);
    };

    const handleReset = () => {
        setTimerRunning(false);
        setTimeRemaining(60);
    };


    useEffect(() => {
        // Ask the server for the latest race data on page load
        socket.emit("getRaceData");

        // Listen for updates to the race data
        const handleRaceData = (data) => {
            console.log("Received updated race data from server:", data);
            setRaceData(data); // Update race data state
        };

        socket.on("raceData", handleRaceData);

        // Clean up the socket listener on unmount
        return () => {
            socket.off("raceData", handleRaceData);
        };
    }, []);

    const handleRaceSelection = (e) => {
        setSelectedRace(e.target.value); // Update the selected race
    };

    // Filter the drivers based on the selected race
    const driversToDisplay = selectedRace
        ? raceData.find((race) => race.raceName === selectedRace)?.drivers || []
        : [];

    return (
        <div style={{textAlign: "center"}}>
            <h1>Race Control Interface</h1>
            <h5>Time remaining:</h5>
            <div className="countdown-timer-container">{timeRemaining.toFixed(1)}</div>
            <h2>Race controls:</h2>
            <button onClick={handleRaceStart}>Safe</button>
            <button>Hazard</button>
            <button onClick={handleRacePause}>Danger</button>
            <button>Finish</button>
            <h2>Select a Race:</h2>
            <select onChange={handleRaceSelection} value={selectedRace}>
                <option value="">-- All Races --</option>
                {raceData.map((race, index) => (
                    <option key={index} value={race.raceName}>
                        {race.raceName}
                    </option>
                ))}
            </select>

            <h2>Drivers List:</h2>
            {selectedRace && <h3>Race: {selectedRace}</h3>}
            <ul>
                {driversToDisplay.map((driver, index) => (
                    <li key={index}>
                        {driver.name} - Car {driver.car}
                    </li>
                ))}
            </ul>

            {!selectedRace && (
                <>
                    <h3>All Drivers Across All Races:</h3>
                    {raceData.map((race, index) => (
                        <div key={index}>
                            <h4>{race.raceName}</h4>
                            <ul>
                                {race.drivers.map((driver, driverIndex) => (
                                    <li key={driverIndex}>
                                        {driver.name} - Car {driver.car}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </>
            )}
        </div>
    );
}

export default RaceControl;
