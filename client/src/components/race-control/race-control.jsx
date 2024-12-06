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
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [raceStarted, setRaceStarted] = useState(false);
    //const previousRaceDataLength = useRef(0);
    const [currentRaceIndex, setCurrentRaceIndex] = useState();
    const [areAllRacesFinished, setAreAllRacesFinished] = useState(true);
    //const [queuePositionFetched, setQueuePositionFetched] = useState(false);
    //const currentRaceIndex = useRef(0);
    const currentRace = raceData[currentRaceIndex] || {};

    useEffect(() => {
        // Request the latest race data and queue position from the server
        socket.emit("getQueuePosition");
        //if (!queuePositionFetched) return;
        socket.emit("getAreAllRacesFinished");
        socket.emit("getRaceData");

        const handleRaceQueue = (queue) => {
            console.log("Queue pos from server: " + queue)
            setCurrentRaceIndex(queue); // Synchronize with server
        };

        const handleRaceData = (data) => {
            // If the areAllRacesFinished is true and new races are added, set it to the first new race
            console.log("data.length:", data.length);
            console.log("currentRaceIndex+1:", currentRaceIndex+1);
            if (areAllRacesFinished === true && data.length > currentRaceIndex+1) {
                //console.log("data.length:", data.length);
                //console.log("currentRaceIndex+1:", currentRaceIndex+1);
                setAreAllRacesFinished(false);
                socket.emit("updateAreAllRacesFinished", false);
            }

            setRaceData(data);
        };

        const handleAreAllRacesFinished = (data) => {
            console.log("AreAllRacesFinished value from server: " + data);
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

        return () => {
            socket.off("queuePosition", handleRaceQueue);
            socket.off("raceData", handleRaceData);
            socket.off("timerUpdate", handleTimerUpdate);
            socket.off("areAllRacesFinished", handleAreAllRacesFinished);
        };
    }, [currentRace?.raceName, currentRaceIndex, areAllRacesFinished]);


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
    function handleRaceMode(event) {
        switch (event.target.value) {
            case "danger":
                console.log(raceData)
                pauseTimer();
                break;
            case "safe":
                startTimer();
                break;
            case "start":
                startTimer();
                socket.emit("updateRaceStatus", { raceName: currentRace.raceName, isOngoing: true, timeRemainingOngoingRace: timeRemaining, }); // Notify server
                setRaceStarted(true);
                break;
            case "hazard":
                console.log(raceData)
                break;
            case "finish":
                resetTimer();
                socket.emit("updateRaceStatus", { raceName: currentRace.raceName, isOngoing: false, }); // Notify server
                //console.log(currentRaceIndex);
                setRaceStarted(false);
                if (currentRaceIndex < raceData.length-1) {
                    //setAreAllRacesFinished(false);
                    //socket.emit("updateAreAllRacesFinished", false);
                    const nextRaceIndex = currentRaceIndex + 1;
                    setCurrentRaceIndex(nextRaceIndex);
                    socket.emit("updateQueuePosition", nextRaceIndex);
                } else {
                    setAreAllRacesFinished(true);
                    //console.log("i was here, currentraceindex should be -1 but is:", currentRaceIndex);
                    socket.emit("updateAreAllRacesFinished", true);
                }
                break;
            default:
                break;
        }
        socket.emit("flagButtonWasClicked", event.target.value);
    };


    return (
        <div style={{textAlign: "center"}}>
            <h1>Race Control Interface</h1>
            {raceStarted && (
                <div>
                    <h5>Time remaining:</h5>
                    <div className="countdown-timer-container">{formatTimer(timeRemaining)}</div>
                    <h2>Race controls:</h2>
                    <button onClick={handleRaceMode} value="safe">Safe</button>
                    <button onClick={handleRaceMode} value="danger">Danger!</button>
                    <button onClick={handleRaceMode} value="hazard">Hazardous!</button>
                    <button onClick={handleRaceMode} value="finish">Finish!</button>
                </div>)}
            {!raceStarted && !areAllRacesFinished && (
                <>
                    {currentRace ? (
                        <h2>Next Race: {currentRace.raceName}</h2>
                    ) : (
                        <h2>No races in the queue</h2>
                    )}
                </>
            )}
            {currentRace && (
                <>
                    <ul>
                        {!raceStarted && areAllRacesFinished !== true && (
                            <>
                                <button
                                    className="waves-effect waves-light btn"
                                    /*                                style={{backgroundColor: "blue", color: "white"}}*/
                                    onClick={handleRaceMode} value="start">Start race</button>
                                <h2>Drivers List:</h2>
                                {driversToDisplay.map((driver, index) => (
                                    <li key={index}>
                                        {driver.name} - Car {driver.car}
                                    </li>
                                ))}
                            </>
                        )}
                        {areAllRacesFinished === true && (
                            <p>Next race has not been submitted</p>
                        )}
                    </ul>
                </>
            )}
        </div>
    );
}

export default RaceControl;
