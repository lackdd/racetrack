// The Lap-line observer has been given a tablet which may be used in landscape or portrait.
// Their interface requires 1 button for each car which will be pressed as the respective car passes the lap-line.
// The button must simply have the car's number on it.
// As many cars cross the lap-line quickly and often, the buttons must be very hard to miss (they must occupy a large tappable area).

// Cars can still cross the lap line when the race is in finish mode.
// The observer's display should show a message to indicate that the race session is ended once that has been declared by the Safety Official.
// The buttons must not function after the race is ended. They should disappear or be visually disabled.

import {useEffect, useState} from "react";
import button from "bootstrap/js/src/button.js";
import "./lap-line-observer.css"

import socket from "../../socket.js";


// main function for lap line observer
function LapLineObserver() {

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

        // Clean up the event listener when the component unmounts
        return () => {
            socket.off("broadcastFlagButtonChange");
        };
    }, []);



    // update race data when flagStatus changes to "safe"
    useEffect(() => {
        // Fetch the latest race data from the server
        socket.emit("getRaceData");

        // get drivers' info
        const handleRaceData = (data) => {
            console.log("Received race data from server:", data);
            setRaceDrivers(data[0].drivers)
            // if (Array.isArray(data) && data.length > 0 && data[0].hasOwnProperty('drivers')) {
            //     // Create a new array with the "laps" property added to each driver object
            //     const updatedRaceDrivers = data[0].drivers.map((driver) => ({
            //         ...driver,
            //         laps: 0,
            //     }));
            //     setRaceDrivers(updatedRaceDrivers);
            // } else {
            //     console.error("Invalid race data received");
            // }
        };

        socket.on("raceData", handleRaceData);

        return () => {
            socket.off("raceData", handleRaceData);
        };
    }, []); // flagStatus === "safe", flagStatus === "gray"


    // when driver finishes a lap (or starts the first lap) (car's button is pressed)
    function driverFinishedLap(driverName) {
        //socket.emit("driver finished"); // save and emit drivers lap time

        // Find the driver in the raceDrivers array whose name matches the driverName
        const updatedRaceDrivers = raceDrivers.map((driver) => {
            if (driver.name === driverName) {
                // Increment the driver's laps by 1
                return { ...driver, laps: driver.laps + 1 };
            } else {
                return driver;
            }

        });

        setRaceDrivers(updatedRaceDrivers);

        console.log("driver finished");
        console.log(raceDrivers);
        // After the Safety Official has briefed the drivers, the timer is started and the race begins.
        // The cars set off from the pit lane once it is safe to do so.
        // Each car is considered to start its first lap (lap 1) as it passes the lap line for the first time.
        // Every time the car passes the lap line, the number of laps is incremented by 1,
        // and the fastest lap time is updated if it is the fastest lap so far.
    }


    return (
        <div className="LapLineObserver">
            <div className="container">
                <div id="observerButtonsGrid">
                    {raceDrivers.length === 0 ? (<p className={"information"}>No drivers submitted yet</p>) :
                        raceDrivers.map((driver, index) => (
                            <button id="observerButton"
                                    key={index}
                                    className="waves-effect waves-light btn-large"
                                    disabled={isDisabled}
                                    onClick={() => driverFinishedLap(driver.name)}>
                                {driver.name}
                            </button>
                        ))}
                    {isDisabled && <p className={"information"}>Race session has ended</p>}
                </div>
            </div>
        </div>
    )
}

export default LapLineObserver;
