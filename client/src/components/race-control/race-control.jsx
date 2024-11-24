import React, {useState, useEffect, useRef} from "react";
import socket from "../../socket.js";

function formatTimer(milliseconds) {
    // todo maybe save as milliseconds so they can easily be compared and reformat after that to display
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const millisecondsRemainder = milliseconds % 1000;

    return milliseconds === undefined ? `01:00:00` : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${millisecondsRemainder.toString().padStart(2, '0')}`;
}

function fastestLapTime(milliseconds) {

}

function RaceControl() {
    const [raceData, setRaceData] = useState([]); // Store all races and their drivers
    const [selectedRace, setSelectedRace] = useState(""); // Store the currently selected race
    const [timeRemainingObj, setTimeRemainingObj] = useState({});
    const [timerRunningObj, setTimerRunningObj] = useState({});
    const [raceStarted, setRaceStarted] = useState(false);
    const timerInterval = useRef({});
    const [isOngoingObj, setIsOngoingObj] = useState({});

    useEffect(() => {
        // Ask the server for the latest race data on page load
        socket.emit("getRaceData");

        // Listen for updates to the race data
        const handleRaceData = (data) => {
            console.log("Received updated race data from server:", data);

            // Sync timer values from server
            setTimeRemainingObj((prev) => {
                const updatedRemainingTimes = { ...prev };
                data.forEach((race) => {
                    updatedRemainingTimes[race.raceName] = race.timeRemaining || 60000; // Default to 1 minute if undefined
                });
                return updatedRemainingTimes;
            });

            // Sync `timerRunningObj` from `isOngoing`
            setTimerRunningObj((prev) => {
                const updatedTimerRunningValues = { ...prev };
                data.forEach((race) => {
                    updatedTimerRunningValues[race.raceName] = race.isOngoing || false;
                });
                return updatedTimerRunningValues;
            });

            setRaceData(data); // Update race data from server
        };

        socket.on("raceData", handleRaceData);

        // Clean up the socket listener on unmount
        return () => {
            socket.off("raceData", handleRaceData);
            // clear all intervals on unmount
            Object.values(timerInterval.current).forEach(clearInterval);
        };
    }, []);

    useEffect(() => {
        if (!selectedRace) return;

        if (timerRunningObj[selectedRace]) {
            // Start the timer for the selected race
            timerInterval.current[selectedRace] = setInterval(() => {
                setTimeRemainingObj((prev) => {
                    const timeLeft = prev[selectedRace];
                    if (timeLeft <= 100) {
                        clearInterval(timerInterval.current[selectedRace]);
                        setTimerRunningObj((prev) => ({
                            ...prev,
                            [selectedRace]: false,
                        }));
                        socket.emit("updateTimerValue", { raceName: selectedRace, timeRemaining: 0 }); // Emit final value
                        return { ...prev, [selectedRace]: 0 };
                    }

                    const newTime = timeLeft - 100;
                    socket.emit("updateTimerValue", { raceName: selectedRace, timeRemaining: newTime }); // Emit updated timer
                    return { ...prev, [selectedRace]: newTime };
                });
            }, 100);
        } else {
            // Stop the timer for the selected race
            clearInterval(timerInterval.current[selectedRace]);
        }

        // Cleanup on race switch or component unmount
        return () => clearInterval(timerInterval.current[selectedRace]);
    }, [timerRunningObj[selectedRace], selectedRace]);

    const handleRaceSelection = (e) => {
        setSelectedRace(e.target.value); // Update the selected race
    };

    // Filter the drivers based on the selected race
    const driversToDisplay = selectedRace
        ? raceData.find((race) => race.raceName === selectedRace)?.drivers || []
        : [];

    //Handle Flag status buttons logic
    function handleRaceMode(event) {
        switch (event.target.value) {
            case "danger":
                setTimerRunningObj((prev) => ({
                    ...prev,
                    [selectedRace]: false,
                }));
                break;
            case "safe":
                setTimerRunningObj((prev) => ({
                    ...prev,
                    [selectedRace]: true,
                }));
                break;
            case "start":
                setTimerRunningObj((prev) => ({
                    ...prev,
                    [selectedRace]: true,
                }));
                socket.emit("updateRaceStatus", { raceName: selectedRace, isOngoing: true }); // Notify server
                setRaceStarted(true);
                break;
            case "hazard":
                break;
            case "finish":
                setTimerRunningObj((prev) => ({
                    ...prev,
                    [selectedRace]: false,
                }));
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
            <div className="countdown-timer-container">{formatTimer(timeRemainingObj[selectedRace]) || 0}</div>
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
