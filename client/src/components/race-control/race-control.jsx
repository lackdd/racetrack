import React, {useState, useEffect, useRef} from "react";
import socket from "../../socket.js";

function formatTimer(milliseconds) {
    // todo maybe save as milliseconds so they can easily be compared and reformat after that to display
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const millisecondsRemainder = milliseconds % 1000;

    return milliseconds === undefined ? `01:00:00` : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${millisecondsRemainder.toString().padStart(2, '0')}`;
}

function RaceControl() {
    const [raceData, setRaceData] = useState([]); // Store all races and their drivers
    const [selectedRace, setSelectedRace] = useState(""); // Store the currently selected race
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [raceStarted, setRaceStarted] = useState(false);

    useEffect(() => {
        // Request the latest race data from the server
        socket.emit("getRaceData");

        // Listen for race data updates
        const handleRaceData = (data) => {
            setRaceData(data);
        };

        // Listen for timer updates for the selected race
        const handleTimerUpdate = (data) => {
            if (data.raceName === selectedRace) {
                setTimeRemaining(data.timeRemaining);
            }
        };

        socket.on("raceData", handleRaceData);
        socket.on("timerUpdate", handleTimerUpdate);

        // Cleanup listeners on unmount
        return () => {
            socket.off("raceData", handleRaceData);
            socket.off("timerUpdate", handleTimerUpdate);
        };
    }, [selectedRace]);

    const startTimer = () => {
        socket.emit("startTimer", selectedRace);
        setRaceStarted(true);
    };

    const pauseTimer = () => {
        socket.emit("pauseTimer", selectedRace);
    };

    const resetTimer = () => {
        socket.emit("resetTimer", selectedRace);
        setRaceStarted(false);
    };

    const handleRaceSelection = (e) => {
        setSelectedRace(e.target.value); // Update the selected race
        // Request the initial timer value for the selected race
        socket.emit("getTimeRemaining", e.target.value, (data) => {
            setTimeRemaining(data.timeRemaining);
        });
    };

    // Filter the drivers based on the selected race
    const driversToDisplay = selectedRace
        ? raceData.find((race) => race.raceName === selectedRace)?.drivers || []
        : [];

    //Handle Flag status buttons logic
    function handleRaceMode(event) {
        switch (event.target.value) {
            case "danger":
                pauseTimer();
                break;
            case "safe":
                startTimer();
                break;
            case "start":
                startTimer();
                socket.emit("updateRaceStatus", { raceName: selectedRace, isOngoing: true }); // Notify server
                setRaceStarted(true);
                break;
            case "hazard":
                break;
            case "finish":
                resetTimer();
                socket.emit("updateRaceStatus", { raceName: selectedRace, isOngoing: false }); // Notify server
                setRaceStarted(false);
                break;
            default:
                break;
        }
        socket.emit("flagButtonWasClicked", event.target.value);
    };

    return (
        <div style={{textAlign: "center"}}>
            <h1>Race Control Interface</h1>
            <h5>Time remaining:</h5>
            <div className="countdown-timer-container">{formatTimer(timeRemaining)}</div>
            {raceStarted && (
                <div>
                    <h2>Race controls:</h2>
                    <button onClick={handleRaceMode} value="safe">Safe</button>
                    <button onClick={handleRaceMode} value="danger">Danger!</button>
                    <button onClick={handleRaceMode} value="hazard">Hazardous!</button>
                    <button onClick={handleRaceMode} value="finish">Finish!</button>
                </div>)}
            { !raceStarted && (
                <>
            <h2>Select a Race:</h2>
            <select onChange={handleRaceSelection} value={selectedRace}>
                <option value="">-- All Races --</option>
                {raceData.map((race, index) => (
                    <option key={index} value={race.raceName}>
                        {race.raceName}
                    </option>
                ))}
            </select>
            </>
    )}

            <h2>Drivers List:</h2>
            {selectedRace && <h3>Race: {selectedRace}</h3>}
            <ul>
                {selectedRace && !raceStarted && (
                    <button onClick={handleRaceMode} value="start">Start race</button>)}
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
