// The Lap-line observer has been given a tablet which may be used in landscape or portrait.
// Their interface requires 1 button for each car which will be pressed as the respective car passes the lap-line.
// The button must simply have the car's number on it.
// As many cars cross the lap-line quickly and often, the buttons must be very hard to miss (they must occupy a large tappable area).

// Cars can still cross the lap line when the race is in finish mode.
// The observer's display should show a message to indicate that the race session is ended once that has been declared by the Safety Official.
// The buttons must not function after the race is ended. They should disappear or be visually disabled.

import React, {useEffect, useState, useRef} from "react";
import button from "bootstrap/js/src/button.js";
import "./lap-line-observer.css"

import socket from "../../socket.js";

// format lap time to readable format
function formatLapTime(milliseconds) {
    // todo maybe save as milliseconds so they can easily be compared and reformat after that to display
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const millisecondsRemainder = milliseconds % 1000;

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${millisecondsRemainder.toString().padStart(2, '0')}`;
}

//calculate the fastest lap time for each driver
function fastestLapTime(laptimes) {
    //laptimes = laptimes.slice(1, laptimes.length)
    if (laptimes.length < 1) { //
        return null
    }
    return Math.min(...laptimes);
}

function LapLineObserver() {
    const [elapsedTimes, setElapsedTimes] = useState({});
    const [timerRunningList, setTimerRunningList] = useState({});
    const [raceDrivers, setRaceDrivers] = useState([]);
    const [raceStarted, setRaceStarted] = useState(false);
    const [flagStatus, setFlagStatus] = useState([]);
    const [isDisabled, setIsDisabled] = useState(() => {
        const storedIsDisabled = localStorage.getItem("isDisabled");
        return storedIsDisabled === "true";
    });

    const timerInterval = useRef({});

    // Handle flag changes
    useEffect(() => {
        socket.emit("broadcastFlagButtonChange");
        socket.on("broadcastFlagButtonChange", (newFlagStatus) => {
            setFlagStatus(newFlagStatus);
            console.log("Flag status changed to: " + newFlagStatus);

            if (newFlagStatus === "finish") {
                setIsDisabled(true);
                console.log("The race has finished!")
            } else {
                setIsDisabled(false);
            }

            if (newFlagStatus === "start") {
                setRaceStarted(true);
                console.log("The race has started!")
            } else {
                setRaceStarted(false);
            }

        });
        console.log("Current race started value: " + raceStarted);
        // Clean up the socket listener on unmount
        return () => {
            socket.off("broadcastFlagButtonChange");
        };
    }, []);


    // Fetch race data
    useEffect(() => {
        if (!raceStarted) {
        socket.emit("getRaceData");

        const handleRaceData = (raceData) => {

            const onGoingRace = raceData.filter((race) => race.isOngoing === true);

            if (onGoingRace.length > 0) { // (Array.isArray(raceData) && raceData.length > 0 && onGoingRace)
                console.log(onGoingRace)

                // if (onGoingRace.length > 0 && onGoingRace[0].hasOwnProperty("drivers")) {
                const updatedRaceDrivers = onGoingRace[0].drivers.map((driver) => ({
                    ...driver,
                    laps: 0,
                    lapTimes: [],
                    lapTimesMS: [],
                    fastestLap: null,
                }));

                // Initialize elapsed times for all drivers
                const initialElapsedTimes = {};
                updatedRaceDrivers.forEach((driver) => {
                    initialElapsedTimes[driver.name] = 0;
                });

                setElapsedTimes(initialElapsedTimes);
                setRaceDrivers(updatedRaceDrivers);
                console.log(raceData)
                // } else {
                //     console.error("Invalid race data received.");
                // }
            } else {
                console.error("No ongoing race exists");
            }
        };

        socket.on("raceData", handleRaceData);

        // Clean up the socket listener on unmount
        return () => {
            socket.off("raceData", handleRaceData);
        };
    }
    }, [raceStarted]);

    // Start timer for a driver
    const handleRaceStart = (driverName) => {
        if (!timerRunningList[driverName]) {
            setTimerRunningList((prev) => ({
                ...prev,
                [driverName]: true,
            }));

            clearInterval(timerInterval.current[driverName]);

            timerInterval.current[driverName] = setInterval(() => {
                setElapsedTimes((prev) => ({
                    ...prev,
                    [driverName]: (prev[driverName] || 0) + 10,
                }));
            }, 10);


        }

    };

    // Stop and reset timer for a driver
    const handleReset = (driverName) => {
        //clearInterval(timerInterval.current[driverName]);
        setTimerRunningList((prev) => ({
            ...prev,
            [driverName]: false,
        }));
        setElapsedTimes((prev) => ({
            ...prev,
            [driverName]: 0,
        }));
    };

    // Handle lap completion for a driver
    const driverCrossedFinishLine = (driverName) => {
        setRaceDrivers((prev) =>
            prev.map((driver) => {
                if (driver.name === driverName) {
                    if (driver.laps === 0) { // don't save anything on the first click that's starts the first lap's timer
                        return {
                            ...driver,
                            laps: driver.laps + 1,
                        };
                    } else {
                        const newLapTimes = [
                            ...driver.lapTimes,
                            formatLapTime(elapsedTimes[driverName] || 0),
                        ];
                        const newLapTimesMS = [
                            ...driver.lapTimesMS,
                            elapsedTimes[driverName] || 0,
                        ];
                        return {
                            ...driver,
                            laps: driver.laps + 1,
                            lapTimes: newLapTimes,
                            lapTimesMS: newLapTimesMS,
                            fastestLap: formatLapTime(fastestLapTime(driver.lapTimesMS)),
                        };
                    }
                }
                return driver;
            })
        );
        handleReset(driverName);
        handleRaceStart(driverName);
    };


    return (
        <div className="LapLineObserver">
            <div className="container">
                <div id="observerButtonsGrid">
                    {raceDrivers.length === 0 ? (
                        <p className="information">No ongoing race exists</p>
                    ) : (
                        raceDrivers.map((driver, index) => (
                            <button
                                id="observerButton"
                                key={index}
                                className="waves-effect waves-light btn-large"
                                disabled={isDisabled}
                                onClick={() => driverCrossedFinishLine(driver.name)}
                            >
                                {driver.name}
                                <br/>
                                {formatLapTime(elapsedTimes[driver.name] || 0)}
                            </button>
                        ))
                    )}
                    {isDisabled && <p className="information">Race session has ended</p>}
                </div>
            </div>
        </div>
    );
}

export default LapLineObserver;
