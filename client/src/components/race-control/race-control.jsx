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
        socket.emit("getRaceMode");
        socket.emit("getTimerUpdate");

        const handleRaceQueue = (queue) => {
            //console.log("Queue pos from server: " + queue);
            setCurrentRaceIndex(queue); // Synchronize with server
        };

        const handleRaceModeData = (data) => {
            //console.log("Race mode from server: " + data);
            setRaceMode(data);
        };

        const handleRaceData = (data) => {
            // If the areAllRacesFinished is true and new races are added, set it to the first new race
            data.find((race) => {
                if (race.isOngoing === true) {
                    setRaceStarted(true);
                    socket.emit("getTimeRemaining", race.raceName, (response) => {
                        setTimeRemaining(response.timeRemaining);
                    });
                }
            });
            //console.log("data.length:", data.length);
            //console.log("currentRaceIndex+1:", currentRaceIndex+1);
            if (areAllRacesFinished === true && data.length > currentRaceIndex+1) {
                //console.log("data.length:", data.length);
                //console.log("currentRaceIndex+1:", currentRaceIndex+1);
                setAreAllRacesFinished(false);
                socket.emit("updateAreAllRacesFinished", false);
            }

            setRaceData(data);
        };

        const handleAreAllRacesFinished = (data) => {
            //console.log("AreAllRacesFinished value from server: " + data);
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
    function handleRaceMode(event) {
        switch (event.target.value) {
            case "danger":
                //console.log(raceData)
                //pauseTimer();
                setRaceMode("danger");
                socket.emit("updateRaceMode", "danger", currentRace.raceName);
                break;
            case "safe":
                //startTimer();
                setRaceMode("safe");
                socket.emit("updateRaceMode", "safe", currentRace.raceName);
                break;
            case "start":
                //startTimer();
                console.log("emitting updateracestatus: ");
                setRaceStarted(true);
                setRaceMode("safe");
                socket.emit("updateRaceMode", "safe", currentRace.raceName);

                // delete last race
                if (currentRaceIndex > 0) {
                    const raceToRemove = raceData[currentRaceIndex - 1];
                    const updatedRaceData = raceData.filter((race) => race !== raceToRemove);
                    setRaceData(updatedRaceData);
                    const newIndex = currentRaceIndex - 1;
                    setCurrentRaceIndex(newIndex);
                    socket.emit("updateQueuePosition", newIndex);
                    socket.emit("updateRaceData", updatedRaceData);
                }
                socket.emit("updateRaceStatus", { raceName: currentRace.raceName, isOngoing: true, timeRemainingOngoingRace: timeRemaining, }); // Notify server
                break;
            case "hazard":
                //console.log(raceData)
                setRaceMode("hazard");
                socket.emit("updateRaceMode", "hazard", currentRace.raceName);
                break;
            case "finish":
                //resetTimer();
                //socket.emit("updateRaceStatus", { raceName: currentRace.raceName, isOngoing: false, }); // Notify server
                //console.log(currentRaceIndex);
                //setRaceStarted(false);

                /*if (currentRaceIndex < raceData.length-1) {
                    //setAreAllRacesFinished(false);
                    //socket.emit("updateAreAllRacesFinished", false);
                    const nextRaceIndex = currentRaceIndex + 1;
                    setCurrentRaceIndex(nextRaceIndex);
                    socket.emit("updateQueuePosition", nextRaceIndex);
                } else {
                    setAreAllRacesFinished(true);
                    //console.log("i was here, currentraceindex should be -1 but is:", currentRaceIndex);
                    socket.emit("updateAreAllRacesFinished", true);
                }*/
                setRaceMode("finish");
                socket.emit("updateRaceMode", "finish", currentRace.raceName);
                break;
            default:
                break;
        }
        //socket.emit("flagButtonWasClicked", event.target.value);
    };

    function handleEndRace() {
        socket.emit("flagButtonWasClicked", "danger");
        if (currentRaceIndex < raceData.length-1) {
            let nextRaceIndex = currentRaceIndex + 1;
            setCurrentRaceIndex(nextRaceIndex);
            socket.emit("updateQueuePosition", nextRaceIndex);
        } else {
            setAreAllRacesFinished(true);
            socket.emit("updateAreAllRacesFinished", true);
            console.log(currentRace.raceName);
        }
        socket.emit("updateRaceStatus", {raceName: currentRace.raceName, isOngoing: false,});
        setRaceStarted(false);
    };

    return (
        <div className="race-control" style={{textAlign: "center"}}>
            <h1 className="header">Race Control Interface</h1>
            {raceStarted && raceMode !== "finish" && (
                <div >
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
                                    /*                                style={{backgroundColor: "blue", color: "white"}}*/
                                    onClick={handleRaceMode} value="start">Start race</button>
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
