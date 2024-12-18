import React, {useState, useEffect, useRef} from "react";
import socket from "../../socket.js";
import "./race-control.css";

function formatTimer(milliseconds) {
    // todo maybe save as milliseconds so they can easily be compared and reformat after that to display
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const millisecondsRemainder = milliseconds % 1000 / 10;

    return milliseconds === undefined ? `01:00:00` : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${millisecondsRemainder.toString().padStart(2, '0')}`;
}

function RaceControl() {
    const [raceData, setRaceData] = useState([]); // Store all races and their drivers
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [raceStarted, setRaceStarted] = useState(false);
    const [raceMode, setRaceMode] = useState("");
    const [currentRaceIndex, setCurrentRaceIndex] = useState();
    const [areAllRacesFinished, setAreAllRacesFinished] = useState(true);
    const currentRace = raceData[currentRaceIndex] || {};

    useEffect(() => {

        // Request the latest race data and queue position from the server
        socket.emit("getQueuePosition");
        socket.emit("getAreAllRacesFinished");
        socket.emit("getRaceData");
        socket.emit("getRaceMode");
        socket.emit("getTimerUpdate");

        const handleRaceQueue = (queue) => {
            setCurrentRaceIndex(queue); // Synchronize with server
        };

        const handleRaceModeData = (data) => {
            setRaceMode(data);
        };

        const handleRaceData = (data) => {
            data.find((race) => {
                if (race.isOngoing === true) {
                    setRaceStarted(true);
                    socket.emit("getTimeRemaining", race.raceName, (response) => {
                        setTimeRemaining(response.timeRemaining);
                    });
                }
            });
            if (areAllRacesFinished === true && data.length > currentRaceIndex + 1) {
                setAreAllRacesFinished(false);
                socket.emit("updateAreAllRacesFinished", false);
            }

            setRaceData(data);
        };

        const handleAreAllRacesFinished = (data) => {
            setAreAllRacesFinished(data); // Synchronize with server
        };

        const handleTimerUpdate = (data) => {
            if (data.raceName === currentRace?.raceName) {
                setTimeRemaining(data.timeRemaining);
            }
        };

        socket.on("queuePosition", handleRaceQueue);
        socket.on("raceData", handleRaceData);
        socket.on("timerUpdate", handleTimerUpdate);
        socket.on("areAllRacesFinished", handleAreAllRacesFinished);
        socket.on("raceMode", handleRaceModeData);

        return () => {
            socket.off("queuePosition", handleRaceQueue);
            socket.off("raceData", handleRaceData);
            socket.off("timerUpdate", handleTimerUpdate);
            socket.off("areAllRacesFinished", handleAreAllRacesFinished);
            socket.off("raceMode", handleRaceModeData);
        };
    }, [currentRace?.raceName, currentRaceIndex, areAllRacesFinished, raceMode]);


    const startTimer = () => {
        socket.emit("startTimer", currentRace.raceName);
    };

    const pauseTimer = () => {
        socket.emit("pauseTimer", currentRace.raceName);
    };

    const resetTimer = () => {
        socket.emit("resetTimer", currentRace.raceName);
    };

    // Filter the drivers based on the selected race
    const driversToDisplay = currentRace?.drivers || [];

    //Handle Flag status buttons logic
    async function handleRaceMode(event) {
        switch (event.target.value) {
            case "danger":
                setRaceMode("danger");
                socket.emit("updateRaceMode", "danger", currentRace.raceName);
                break;
            case "safe":
                setRaceMode("safe");
                socket.emit("updateRaceMode", "safe", currentRace.raceName);
                break;
            case "start":
                setRaceStarted(true);
                setRaceMode("safe");
                socket.emit("updateLastRaceData", currentRace);
                socket.emit("updateRaceMode", "safe", currentRace.raceName);
                socket.emit("updateRaceStatus", {
                    raceName: currentRace.raceName,
                    isOngoing: true,
                    timeRemainingOngoingRace: timeRemaining,
                }); // Notify server
                break;
            case "hazard":
                setRaceMode("hazard");
                socket.emit("updateRaceMode", "hazard", currentRace.raceName);
                break;
            case "finish":
                setRaceMode("finish");
                socket.emit("updateRaceMode", "finish", currentRace.raceName);
                break;
            default:
                break;
        }
    };

    function handleEndRace() {
        socket.emit("updateRaceMode", "danger");
        if (currentRaceIndex < raceData.length - 1) {
        } else {
            setAreAllRacesFinished(true);
            socket.emit("updateAreAllRacesFinished", true);
        }
        socket.emit("updateRaceStatus", {raceName: currentRace.raceName, isOngoing: false,});
        setRaceStarted(false);

        // delete last race
        const raceToRemove = raceData[currentRaceIndex];
        socket.emit("deleteRace", raceToRemove.raceName);
    };

    return (
        <div className="race-control" style={{textAlign: "center"}}>
            <h1 className="header">Race Control Interface</h1>
            {raceStarted && raceMode !== "finish" && (
                <div>
                    <h5 className="header">Time remaining:</h5>
                    <div className="countdown-timer-container">{formatTimer(timeRemaining)}</div>
                    <h2 className="header">Race controls:</h2>
                    <button className="button" onClick={handleRaceMode} value="safe">Safe</button>
                    <button className="button" onClick={handleRaceMode} value="danger">Danger!</button>
                    <button className="button" onClick={handleRaceMode} value="hazard">Hazardous!</button>
                    <button className="button" onClick={handleRaceMode} value="finish">Finish!</button>
                </div>)}
            {raceStarted && raceMode === "finish" && (
                <button className="button" onClick={handleEndRace}>End race session</button>
            )}
            {!raceStarted && !areAllRacesFinished && (
                <>
                    {currentRace ? (
                        <h2 className="header">Next Race: {currentRace.raceName}</h2>
                    ) : (
                        <h2>No races in the queue</h2>
                    )}
                </>
            )}
            {currentRace && (
                <>
                    <ul className="ul">
                        {!raceStarted && areAllRacesFinished !== true && (
                            <>
                                <button
                                    className="button"
                                    onClick={handleRaceMode} value="start">Start race
                                </button>
                                <h2 className="header">Drivers List:</h2>
                                {driversToDisplay.map((driver, index) => (
                                    <li key={index}>
                                        <span className="driver-details">
                                        {driver.name} - Car {driver.car}
                                            </span>
                                    </li>
                                ))}
                            </>
                        )}
                        {areAllRacesFinished === true && raceStarted === false && (
                            <p className="header">Next race has not been submitted</p>
                        )}
                    </ul>
                </>
            )}
        </div>
    );
}

export default RaceControl;
