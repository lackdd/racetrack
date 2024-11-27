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
    const [currentRaceIndex, setCurrentRaceIndex] = useState(1);
    //const currentRaceIndex = useRef(0);
    const currentRace = raceData[currentRaceIndex] || {};

    useEffect(() => {
        // Request the latest race data from the server
        socket.emit("getRaceData");
        socket.emit("getQueuePosition");


        // Listen for race data updates
        const handleRaceData = (data) => {
            console.log("Received race data from server:", data);
            setRaceData(data);
            //setCurrentRaceIndex(data[]);
        };

        const handleRaceQueue = (queue) => {
            console.log("Received race queue from server:", queue);
            setCurrentRaceIndex(queue);
        };

        // Listen for timer updates for the selected race
        const handleTimerUpdate = (data) => {
            if (data.raceName === currentRace.raceName) {
                setTimeRemaining(data.timeRemaining);
            }
        };

        socket.on("raceData", handleRaceData);
        socket.on("queuePosition", handleRaceQueue);
        //socket.on("timerUpdate", handleTimerUpdate);

        // Cleanup listeners on unmount
        return () => {
            socket.off("raceData", handleRaceData);
            socket.off("queuePosition", handleRaceQueue);
            //socket.off("timerUpdate", handleTimerUpdate);
        };
    }, [currentRace.raceName]);

    const startTimer = () => {
        socket.emit("startTimer", currentRace.raceName);
        setRaceStarted(true);
    };

    const pauseTimer = () => {
        socket.emit("pauseTimer", currentRace.raceName);
    };

    const resetTimer = () => {
        socket.emit("resetTimer", currentRace.raceName);
        setRaceStarted(false);
    };

    // Filter the drivers based on the selected race
    const driversToDisplay = currentRace?.drivers || [];

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
                socket.emit("updateRaceStatus", { raceName: currentRace.raceName, isOngoing: true, timeRemainingOngoingRace: timeRemaining, }); // Notify server
                setRaceStarted(true);
                break;
            case "hazard":
                break;
            case "finish":
                resetTimer();
                socket.emit("updateRaceStatus", { raceName: currentRace.raceName, isOngoing: false, }); // Notify server
                console.log(currentRaceIndex);
                socket.emit("updateQueuePosition", currentRaceIndex+1);
                setRaceStarted(false);
                /*if (currentRaceIndex + 1 < raceData.length) {
                    setCurrentRaceIndex(currentRaceIndex + 1);
                    //setRaceData[0].queuePosition(10);
                } else if (currentRaceIndex + 1 === raceData.length) {
                    setCurrentRaceIndex(-1);
                }*/
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
            {!raceStarted && (
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
                        {!raceStarted && currentRaceIndex !== -1 && (
                            <>
                            <button onClick={handleRaceMode} value="start">Start race</button>
                        <h2>Drivers List:</h2>
                        {driversToDisplay.map((driver, index) => (
                            <li key={index}>
                                {driver.name} - Car {driver.car}
                            </li>
                        ))}
                            </>
                    )}
                    </ul>
                </>
            )}
        </div>
    );
}

export default RaceControl;
