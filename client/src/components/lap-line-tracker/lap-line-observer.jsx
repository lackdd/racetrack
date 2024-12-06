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
    const [raceMode, setRaceMode] = useState("");
    const [currentRaceName, setCurrentRaceName] = useState("");
    const [isDisabled, setIsDisabled] = useState(() => {
        const storedIsDisabled = localStorage.getItem("isDisabled");
        return storedIsDisabled === "true";
    });
    const [currentLapTimes, setCurrentLapTimes] = useState({});

    // Handle incoming flag changes (race modes)
    useEffect(() => {
        socket.emit("flagButtonWasClicked");

        socket.on("broadcastFlagButtonChange", (newFlagStatus) => {
            setRaceMode(newFlagStatus);
            console.log("Getting flag status from server")
        });

        // Clean up the socket listener on unmount
        return () => {
            socket.off("broadcastFlagButtonChange");
        };
    }, []);

    // use flag changes (race mode) to start and finish the race
    useEffect(() => {
        console.log("Flag status changed to: " + raceMode);

        if (raceMode === "finish") {
            setIsDisabled(true);
            setRaceStarted(false);
            console.log("The race has finished! Final results:");
            //handleRaceStop();
            stopStopwatch(raceDrivers)
        }

        if (raceMode === "start" || raceMode === "safe" || raceMode === "danger" || raceMode === "hazard") {
            // if (raceMode === "start") {
            //     setRaceMode("safe");
            // }
            setIsDisabled(false);
            setRaceStarted(true);
            console.log("The race has started!");
        }

    }, [raceMode]);

    // Memoized function to handle incoming race data
    const handleRaceData = useCallback((raceData) => {
        const onGoingRace = raceData.filter((race) => race.isOngoing === true);
        setCurrentRaceName(onGoingRace[0].raceName);
        if (onGoingRace.length > 0) {
            const updatedRaceDrivers = onGoingRace[0].drivers

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

    // Fetch race data
    useEffect(() => {
        if (raceStarted) {
            socket.emit("sendRaceData");

            socket.on("sendRaceData", (data) => {
                console.log("New data fetched");
                handleRaceData(data);
            });

            // Clean up the socket listener on unmount
            return () => {
                socket.off("sendRaceData", handleRaceData);
            };
        } else {
            console.log("Race is not started or has finished.");
        }
    }, [raceStarted, handleRaceData]);

    // always get the latest stopwatch data form the server
    useEffect(() => {
        socket.emit("getCurrentLapTimesInRealTime");
        socket.on("currentLapTimesInRealTime", (lapTimes) => {
            if (lapTimes !== null) {
                setCurrentLapTimes(lapTimes)
            }
        });
        return () => {
            socket.off("currentLapTimesInRealTime");
        };
    }, [raceDrivers]);

    // emit the latest lap data when a driver finishes a lap
    useEffect(() => {
        console.log(raceDrivers)
        socket.emit("updateRaceDrivers", {raceName: currentRaceName, drivers: raceDrivers})
    }, [raceDrivers]);

    // functions to handle stopwatch logic through the server
    const startStopwatch = (driverName) => {
        socket.emit("startStopwatch", driverName);
    };

    const resetStopwatch = (driverName) => {
        socket.emit("resetStopwatch", driverName);
    };

    const stopStopwatch = (raceDrivers) => {
        socket.emit("stopStopwatch", raceDrivers);
    };

    const initializeStopwatch = (driverName) => {
        socket.emit("initializeStopwatch", driverName);
    };

    // Handle lap completion for a driver
    const driverCrossedFinishLine = (driverName) => {
        setRaceDrivers((prev) =>
            prev.map((driver) => {
                console.log(currentLapTimes[driverName])
                if (driver.name === driverName && currentLapTimes[driverName] !== undefined) {
                    const newLapTimes = [
                        ...driver.lapTimes,
                        formatLapTime(currentLapTimes[driverName] || 0),
                    ];
                    const newLapTimesMS = [
                        ...driver.lapTimesMS,
                        currentLapTimes[driverName] || 0,
                    ];
                    return {
                        ...driver,
                        finishedLaps: driver.finishedLaps + 1,
                        lapTimes: newLapTimes,
                        lapTimesMS: newLapTimesMS,
                        fastestLap: formatLapTime(fastestLapTime(newLapTimesMS)),
                    }
                }
                return driver;
            })
        );
        initializeStopwatch(driverName);
        resetStopwatch(driverName);
        startStopwatch(driverName);
    };

    return (
        <div className="LapLineObserver">
            <div className="container">
                <div id="observerButtonsGrid">
                    {raceDrivers.length === 0 && isDisabled === false ? (
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
                                {formatLapTime(currentLapTimes[driver.name] || 0)}
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
