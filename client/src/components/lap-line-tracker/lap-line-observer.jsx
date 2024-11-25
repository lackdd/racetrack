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
    const [flagStatus, setFlagStatus] = useState(null);
    const [isDisabled, setIsDisabled] = useState(() => {
        const storedIsDisabled = localStorage.getItem("isDisabled");
        return storedIsDisabled === "true";
    });

    const timerInterval = useRef({});

    // Handle flag changes
    useEffect(() => {
        socket.on("broadcastFlagButtonChange", (newFlagStatus) => {
            setFlagStatus(newFlagStatus);
            if (newFlagStatus === "finish") {
                setIsDisabled(true);
            } else {
                setIsDisabled(false);
            }
        });

        return () => socket.off("broadcastFlagButtonChange");
    }, []);

    // Fetch race data
    useEffect(() => {
        socket.emit("getRaceData");

        const handleRaceData = (data) => {
            if (Array.isArray(data) && data.length > 0 && data[0].hasOwnProperty("drivers")) {
                const updatedRaceDrivers = data[0].drivers.map((driver) => ({
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
            } else {
                console.error("Invalid race data received.");
            }
        };

        socket.on("raceData", handleRaceData);
        return () => socket.off("raceData", handleRaceData);
    }, []);

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
                        <p className="information">No drivers submitted yet</p>
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
