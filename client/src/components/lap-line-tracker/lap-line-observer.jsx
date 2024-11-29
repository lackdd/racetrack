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

    const timerInterval = useRef({});

    // Handle incoming flag changes -> race modes
    useEffect(() => {
        socket.emit("broadcastFlagButtonChange");
        socket.on("broadcastFlagButtonChange", (newFlagStatus) => {
            setRaceMode(newFlagStatus);
            console.log("Getting flag status from server")
        });

        // Clean up the socket listener on unmount
        return () => {
            socket.off("broadcastFlagButtonChange");
        };
    }, []);

    // use flag changes -> race mode
    useEffect(() => {
        console.log("Flag status changed to: " + raceMode);

        if (raceMode === "finish") {
            setIsDisabled(true);
            setRaceStarted(false);
            console.log("The race has finished! Final results:");
            handleRaceStop();
        }

        if (raceMode === "start") {
            setRaceMode("safe");
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
                console.log("inside handleRaceData")
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

    // Fetch race data
    useEffect(() => {
        if (raceStarted) {
            console.log("Race has started, fetching data...");
            socket.emit("sendRaceData");

            socket.on("sendRaceData", (data) => {
                console.log("New data fetched");
                handleRaceData(data);
                // if (raceStarted === false) {
                //     handleRaceData(data);
                // }
            });

            // Clean up the socket listener on unmount
            return () => {
                socket.off("sendRaceData", handleRaceData);
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


    const handleRaceStop = (driverName) => {
        raceDrivers.forEach((driver) => {
            clearInterval(timerInterval.current[driver.name]);
        });
        console.log(raceDrivers)
    };

    // Handle lap completion for a driver
    const driverCrossedFinishLine = (driverName) => {
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
                            fastestLap: formatLapTime(fastestLapTime(newLapTimesMS)),
                        };
                    }
                }
                return driver;
            })
        );
        // todo when flag status changes to "safe" the timers reset. Currently only when the first flag status after start is "safe" then the timers reset
        // todo emit data to server
        handleReset(driverName);
        handleRaceStart(driverName);
    };

    // latest lap data
    useEffect(() => {
        console.log(currentRaceName);
        console.log(raceDrivers)
        socket.emit("updateRaceDrivers", {raceName: currentRaceName, drivers: raceDrivers})
    }, [raceDrivers]); // or use elapsedTimes as a dependency so current lap times can be updated

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
