import React, { useCallback, useEffect, useState, useRef } from "react";
import "./lap-line-observer.css";
import socket from "../../socket.js";

// Helper function to format lap times
function formatLapTime(milliseconds) {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const millisecondsRemainder = milliseconds % 1000;

    return `${minutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}:${millisecondsRemainder.toString().padStart(3, '0')}`;
}

// Helper function to calculate the fastest lap time for each driver
function fastestLapTime(laptimes) {
    if (laptimes.length < 1) {
        return null;
    }
    return Math.min(...laptimes);
}

function LapLineObserver() {
    const [elapsedTimes, setElapsedTimes] = useState({});
    const [raceDrivers, setRaceDrivers] = useState([]);
    const [raceStarted, setRaceStarted] = useState(false);
    const [flagStatus, setFlagStatus] = useState([]);
    const [isDisabled, setIsDisabled] = useState(() => {
        const storedIsDisabled = localStorage.getItem("isDisabled");
        return storedIsDisabled === "true";
    });

    const timerInterval = useRef({});

    // Memoized function to handle incoming race data
    const handleRaceData = useCallback((raceData) => {
        const onGoingRace = raceData.filter((race) => race.isOngoing === true);

        if (onGoingRace.length > 0) {
            const updatedRaceDrivers = onGoingRace[0].drivers.map((driver) => ({
                ...driver,
                laps: 0,
                lapTimes: [],
                lapTimesMS: [],
                fastestLap: null,
            }));

            const initialElapsedTimes = {};
            updatedRaceDrivers.forEach((driver) => {
                initialElapsedTimes[driver.name] = 0;
            });

            // Compare and update `elapsedTimes` only if it has changed
            setElapsedTimes((prev) => {
                if (JSON.stringify(prev) !== JSON.stringify(initialElapsedTimes)) {
                    return initialElapsedTimes;
                }
                return prev; // No change, skip re-render
            });

            // Compare and update `raceDrivers` only if it has changed
            setRaceDrivers((prev) => {
                if (JSON.stringify(prev) !== JSON.stringify(updatedRaceDrivers)) {
                    return updatedRaceDrivers;
                }
                return prev; // No change, skip re-render
            });
        } else {
            console.error("No ongoing race exists.");
        }
    }, []);

    // Handle flag changes
    useEffect(() => {
        socket.emit("broadcastFlagButtonChange");
        socket.on("broadcastFlagButtonChange", (newFlagStatus) => {
            setFlagStatus(newFlagStatus);
            console.log("Flag status changed to: " + newFlagStatus);

            if (newFlagStatus === "finish") {
                setIsDisabled(true);
                setRaceStarted(false);
                console.log("Race started = false");
                console.log("The race has finished!");
            } else {
                setIsDisabled(false);
            }

            if (newFlagStatus === "start") {
                setRaceStarted(true);
                console.log("Race started = true");
            }
        });

        // Clean up the socket listener on unmount
        return () => {
            socket.off("broadcastFlagButtonChange");
        };
    }, []);

    // Fetch race data
    useEffect(() => {
        if (raceStarted) {
            console.log("Race has started, fetching data...");
            socket.emit("getRaceData");

            socket.on("raceData", handleRaceData);

            // Clean up the socket listener on unmount
            return () => {
                socket.off("raceData", handleRaceData);
            };
        } else {
            console.log("Race is not started or has finished.");
        }
    }, [raceStarted, handleRaceData]);

    // Start timer for a driver
    const handleRaceStart = (driverName) => {
        if (!timerInterval.current[driverName]) {
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
        clearInterval(timerInterval.current[driverName]);
        delete timerInterval.current[driverName];
        setElapsedTimes((prev) => ({
            ...prev,
            [driverName]: 0,
        }));
    };

    // Handle lap completion for a driver
    const driverCrossedFinishLine = (driverName) => {
        console.log(raceDrivers);
        setRaceDrivers((prev) =>
            prev.map((driver) => {
                if (driver.name === driverName) {
                    if (driver.laps === 0) {
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
                                <br />
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
