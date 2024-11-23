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

// function lapTimer() {
//     let [elapsedTime, setElapsedTime] = useState(0);
//     let [timerRunning, setTimerRunning] = useState(false);
//     let timerInterval;
//
//
//     //setTimerRunning(timerStarted);
//
//     useEffect(() => {
//         if (timerRunning) {
//             timerInterval = setInterval(() => {
//                 setElapsedTime((prevElapsedTime) => {
//                     if (prevElapsedTime >= 60) {
//                         clearInterval(timerInterval);
//                         setTimerRunning(false);
//                         console.log("Timer finished!");
//                         return 0;
//                     }
//                     return prevElapsedTime + 0.1;
//                 });
//             }, 100);
//         }
//
//
//         return () => clearInterval(timerInterval);
//     }, [timerRunning]);
// }


// function lapTimer(driver) {
//     // const [lapTimer, setLapTimer] = useState(0)
//     //const lapTimerRef = useRef(0);
//
//     //driver.timer = 0;
//
//
//     // useEffect(() => {
//     //
//     // }, [lapTimerRef]);
//
//     if (driver.laps < 1) {
//
//         clearInterval(driver.currentLapTime);
//         console.log("timer has been started")
//     } else {
//         driver.currentLapTime = setInterval(() => {
//         }, 100); // Update the timer every second
//         clearInterval(driver.currentLapTime);
//         console.log("timer has been reset")
//     }
// }

function formatLapTime(milliseconds) {
    // todo maybe save as milliseconds so they can easily be compared and reformat after that to display
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const millisecondsRemainder = milliseconds % 1000;

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${millisecondsRemainder.toString().padStart(2, '0')}`;
}

// main function for lap line observer
    function LapLineObserver() {


        const [elapsedTime, setElapsedTime] = useState(0);
        //const [elapsedTimes, setElapsedTimes] = useState([]);
        //const [timerRunningList, setTimerRunningList] = useState([]);
        const [timerRunning, setTimerRunning] = useState(false);
        let timerInterval = [];


        //setTimerRunning(timerStarted);

        useEffect(() => {
            if (timerRunning) {
                timerInterval = setInterval(() => {
                    setElapsedTime((prevElapsedTime) => {
                        if (prevElapsedTime >= 60) {
                            setTimerRunning(false);
                            clearInterval(timerInterval);
                            console.log("Timer finished!");
                            return 60;
                        }
                        return prevElapsedTime + 0.01;
                    });
                }, 10);
            }


            return () => clearInterval(timerInterval);
        }, [timerRunning]);


            const [raceDrivers, setRaceDrivers] = useState([]);
            const [flagStatus, setFlagStatus] = useState(null)
            const [isDisabled, setIsDisabled] = useState(() => {
                const storedIsDisabled = localStorage.getItem("isDisabled");
                return storedIsDisabled === "true";
            });


            // set the local storage value of "isDisabled" when isDisabled changes
            useEffect(() => {
                localStorage.setItem("isDisabled", isDisabled.toString());
            }, [isDisabled]);


            // get the flag status information form the server
            useEffect(() => {
                // Listen for the "broadcastFlagButtonChange" event from the server
                socket.on("broadcastFlagButtonChange", (newFlagStatus) => {
                    console.log(newFlagStatus);
                    setFlagStatus(newFlagStatus)
                    if (newFlagStatus === "finish") { // flag status is "finish" when the timer hits 0
                        setIsDisabled(true); // Disable the buttons when the race ends
                        // stop the timer and reset the values
                    } else {
                        setIsDisabled(false) // enable the buttons again when flag status is not "finish"
                    }
                });

                return () => { // Clean up the event listener when the component unmounts
                    socket.off("broadcastFlagButtonChange");
                };
            }, []);

            // update race data when flagStatus changes to "safe"
            useEffect(() => {
                socket.emit("getRaceData"); // fetches twice

                // get drivers' info
                const handleRaceData = (data) => {
                    console.log("Received race data from server:", data);
                    // setRaceDrivers(data[0].drivers)
                    if (Array.isArray(data) && data.length > 0 && data[0].hasOwnProperty('drivers')) {
                        // Create a new array with the "laps" and "lapTimes" properties added to each driver object
                        const updatedRaceDrivers = data[0].drivers.map((driver) => ({
                            ...driver,
                            laps: 0,
                            lapTimes: [],
                            elapsedTime: 0,
                        }));
                        setRaceDrivers(updatedRaceDrivers);
                        // console.log(updatedRaceDrivers)
                    } else {
                        console.error("Invalid race data received");
                    }
                };

                socket.on("raceData", handleRaceData);

                return () => { // Clean up the event listener when the component unmounts
                    socket.off("raceData", handleRaceData);
                };
            }, [flagStatus === "gray"]); // flagStatus === "safe", flagStatus === "gray"

        const handleRaceStart = (driver) => {

            if (!timerRunning && elapsedTime < 60) {
                setTimerRunning(true);

            }
            console.log("Elapsed time: " + elapsedTime.toFixed(2))
            driver.elapsedTime = elapsedTime;
        }
        const handleReset = () => {
            setElapsedTime(0);
        };

//

            // when driver finishes a lap (or starts the first lap) (car's button is pressed)
            function driverFinishedLap(driverName) {

                // Find the driver in the raceDrivers array whose name matches the driverName
                setRaceDrivers(prevState => {
                    return prevState.map((driver) => {
                        if (driver.name === driverName) {
                            //lapTimer(driver);
                            //handleRaceStart(driver);


                            // Increment the driver's laps by 1 and add lap and lap time to driver data

                            if (driver.laps < 1) { // start saving lap times only when driver has crossed the start line once
                                console.log(`driver ${driverName} started their race`);
                                console.log(raceDrivers);
                                //handleReset();
                                handleRaceStart(driver);
                                return {
                                    ...driver,
                                    laps: driver.laps + 1
                                }
                            } else {
                                console.log(`driver ${driverName} finished a lap`);
                                console.log(raceDrivers);
                                //handleReset();
                                handleRaceStart(driver);
                                return {
                                    ...driver,
                                    laps: driver.laps + 1,
                                    lapTimes: [...driver.lapTimes, formatLapTime(driver.elapsedTime.toFixed(2))]
                                };
                            }

                        } else {
                            return driver;
                        }
                    });
                });
            }

            //console.log(raceDrivers)

            return (
                <div className="LapLineObserver">
                    <h5>Time remaining:</h5>
                    <div className="countdown-timer-container">{elapsedTime.toFixed(2)}</div>
                    <p>test</p>
                    <div className="container">
                        <div id="observerButtonsGrid">
                            {raceDrivers.length === 0 ? (<p className={"information"}>No drivers submitted yet</p>) :
                                raceDrivers.map((driver, index) => (
                                    <button id="observerButton"
                                            key={index}
                                            className="waves-effect waves-light btn-large"
                                            disabled={isDisabled}
                                            onClick={() => driverFinishedLap(driver.name)}>
                                        {driver.name}<br/>
                                        {driver.elapsedTime.toFixed(2)}
                                    </button>
                                ))}
                            {isDisabled && <p className={"information"}>Race session has ended</p>}
                        </div>
                    </div>
                </div>
            )
    }

export default LapLineObserver;
