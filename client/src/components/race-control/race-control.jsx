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


    /*useEffect(() => {
        if (timerRunning) {
            timerInterval.current = setInterval(() => {
                setTimeRemaining((prevTime) => {
                    if (prevTime <= 0.1) {
                        clearInterval(timerInterval.current);
                        setTimerRunning(false);
                        console.log("Timer finished!");
                        setRaceStarted(false);
                        return 0;
                    }
                    return prevTime - 0.1;
                });
            }, 100);
        }

        return () => clearInterval(timerInterval);
    }, [timerRunning]);*/

    useEffect(() => {
        // Ask the server for the latest race data on page load
        socket.emit("getRaceData");

        // Listen for updates to the race data
        const handleRaceData = (data) => {
            console.log("Received updated race data from server:", data);
            // Initialize elapsed times for all races
            const initialRemainingTimes = {};
            data.forEach((race) => {
                initialRemainingTimes[race.raceName] = 60000;
            });

            setTimeRemainingObj(initialRemainingTimes);
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

    //Handle Flag status buttons logic
    function handleRaceMode(event) {
        switch (event.target.value) {
            case "danger":
                handleRacePause();
                break;
            case "safe":
                handleRaceStart();
                break;
            case "start":
                console.log(timeRemainingObj[selectedRace]);
                timerForSelectedRace();
                setRaceStarted(true);
                break;
            case "hazard":
                break;
            case "finish":
                handleReset();
                setRaceStarted(false);
                break;
        }
        socket.emit("flagButtonWasClicked", event.target.value);
    };

    const timerForSelectedRace = () => {
        if(selectedRace) {
                        timerInterval.current[selectedRace] = setInterval(() => {
                            setTimeRemainingObj((prev) => {
                                const timeLeft = prev[selectedRace] || 0;
                                if (timeLeft  <= 100) {
                                    clearInterval(timerInterval.current[selectedRace]);
                                    setTimerRunningObj((prevState) => ({
                                        ...prevState,
                                        [selectedRace]: false,
                                    }));
                                    console.log("Timer finished!");
                                    setRaceStarted(false);
                                    return {...prev, [selectedRace]: 0}
                                }
                                return {...prev, [selectedRace]: timeLeft - 100};
                            });
                        }, 100);
                }
        };

    const handleRaceStart = () => {
        if (!timerRunning && timeRemainingObj[selectedRace] > 0) {
            setTimerRunningObj[selectedRace](true);
        }
    };
    const handleRacePause = () => {
        setTimerRunning(false);
    };

/*    const handleReset = () => {
        setTimerRunning(false);
        setTimeRemaining(60);
    };*/

    // Stop and reset timer for a driver
    const handleReset = (selectedRace) => {
        //clearInterval(timerInterval.current[selectedRace]);
        setTimerRunningObj((prev) => ({
            ...prev,
            [selectedRace]: false,
        }));
        setTimeRemainingObj((prev) => ({
            ...prev,
            [selectedRace]: 60000, // in milliseconds
        }));
    };

    return (
        <div style={{textAlign: "center"}}>
            <h1>Race Control Interface</h1>
            <h5>Time remaining:</h5>
{/*            <div className="countdown-timer-container">{timeRemainingObj[selectedRace] || 0}</div>*/}
            <div className="countdown-timer-container">{formatTimer(timeRemainingObj[selectedRace]) || 0}</div>
            {raceStarted && (
                <div>
                    <h2>Race controls:</h2>
                    <button onClick={handleRaceMode} value="safe">Safe</button>
                    <button onClick={handleRaceMode} value="danger">Danger!</button>
                    <button onClick={handleRaceMode} value="hazard">Hazardous!</button>
                    <button onClick={handleRaceMode} value="finish">Finish!</button>
                </div>)}
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
