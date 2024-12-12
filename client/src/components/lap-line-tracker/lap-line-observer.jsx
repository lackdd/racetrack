import React, { useCallback, useEffect, useState } from "react";
import "./lap-line-observer.css";
import "../universal/universal.css"
import socket from "../../socket.js";
import {toggleFullScreen} from "../universal/toggleFullscreen.js";
import {formatLapTime} from "../universal/formatLapTime.js";
import {fastestLapTime} from "../universal/calculateFastestLapTime.js"

function LapLineObserver() {
    //const [elapsedTimes, setElapsedTimes] = useState({});
    const [raceDrivers, setRaceDrivers] = useState([]);
    const [raceStarted, setRaceStarted] = useState(false);
    //const [raceOngoing, setRaceOngoing] = useState(true);
    const [raceMode, setRaceMode] = useState("")
    //const [currentRaceName, setCurrentRaceName] = useState("");
    const [currentRaceName, setCurrentRaceName] = useState(() => {
             return localStorage.getItem("currentRaceName");
    });
    // const [isDisabled, setIsDisabled] = useState(() => {
    //     const storedIsDisabled = localStorage.getItem("isDisabled");
    //     return storedIsDisabled === "true";
    // });
    const [isDisabled, setIsDisabled] = useState("");
    const [currentLapTimes, setCurrentLapTimes] = useState({});

    // Handle incoming flag changes (race modes)
    useEffect(() => {
        socket.emit("getRaceMode");
        socket.emit("getAreAllRacesFinished")

        socket.on("raceMode", (newRacemode) => {
            setRaceMode(newRacemode);
            console.log("Getting race mode from the server")
        });
        socket.on("areAllRacesFinished", (data) => {
            console.log("AreAllRacesFinished value from server: " + data);
            //setRaceOngoing(data);
        });

        // Clean up the socket listener on unmount
        return () => {
            socket.off("raceMode");
        };
    }, []);

    // use flag changes (race mode) to start and finish the race
    useEffect(() => {
        console.log("Race mode changed to: " + raceMode);

        if (raceMode === "finish") {
            setIsDisabled(true);
            setRaceStarted(false);
            console.log("The race has finished! Final results:");
            console.log(raceDrivers)
            //handleRaceStop();
            stopStopwatch(raceDrivers)
        }

        if (raceMode === "safe") {
            setIsDisabled(false);
            setRaceStarted(true);
            console.log("The race has started!");
        }

        // if (raceMode === "danger" || raceMode === "hazard") {
        // }

    }, [raceMode]);

    // Memoized function to handle incoming race data
    const handleRaceData = useCallback((raceData) => {
        const onGoingRace = raceData.filter((race) => race.isOngoing === true);
        if (onGoingRace[0]) {
            setCurrentRaceName(onGoingRace[0].raceName);
        } else {
            setCurrentRaceName("")
            console.error("No ongoing race exists");
            return;
        }
        // try {
        //     setCurrentRaceName(onGoingRace[0].raceName);
        // } catch (err) {
        //     console.error("No ongoing race exists");
        //     return;
        // }
        // if (onGoingRace[0].raceName) {
        //
        // } else {
        //     console.error("No ongoing race exists.");
        // }

        if (onGoingRace.length > 0) {
            const updatedRaceDrivers = onGoingRace[0].drivers

            // Compare and update `raceDrivers` only if it has changed
            setRaceDrivers((prev) => {
                if (JSON.stringify(prev) !== JSON.stringify(updatedRaceDrivers)) {
                    return updatedRaceDrivers;
                }
                return prev; // No change, skip re-render
            });
        }

    }, []);

    // Fetch race data
    useEffect(() => {
        if (raceStarted) {
            socket.emit("getRaceData");

            socket.on("raceData", (data) => {
                console.log("New data fetched");
                handleRaceData(data);
            });

            // Clean up the socket listener on unmount
            return () => {
                socket.off("raceData", handleRaceData);
            };
        } else {
            console.log("Race is not started or has finished.");
        }
    }, [raceStarted]);

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
                if (driver.name === driverName && currentLapTimes[driverName] !== undefined) {
                    console.log(currentLapTimes[driverName])
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
                    {/*{raceDrivers.length === 0 && !isDisabled ? (*/}
                    {!currentRaceName ? (
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
                                <p style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    fontSize: "1.6rem"
                                }}>
                                <span style={{width: "3ch", textAlign: "center"}}>
                                    {formatLapTime(currentLapTimes[driver.name] || 0).minutes}
                                </span>
                                    :
                                    <span style={{width: "3ch", textAlign: "center"}}>
                                    {formatLapTime(currentLapTimes[driver.name] || 0).seconds}
                                </span>
                                    :
                                    <span style={{width: "3ch", textAlign: "center"}}>
                                    {formatLapTime(currentLapTimes[driver.name] || 0).milliseconds}
                                </span>
                                </p>
                            </button>
                        ))
                    )}
                    {/*{isDisabled && <p className="information">Race session has ended</p>}*/}
                    {currentRaceName && raceMode === "finish" && <p className="information">Race session has ended</p>}
                    <button
                        id="fullscreenButton"
                        onClick={toggleFullScreen}>fullscreen
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LapLineObserver;
