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

// when driver finishes (car's button is pressed)
function DriverFinished(setIsDisabled) {
    socket.emit("driver finished"); // emit drivers lap time and save state setIsDisabled(true)
    console.log("driver finished")
    setIsDisabled(true); // disable button when clicked
}

// main function for lap line observer
function LapLineObserver() {
    //const [raceDrivers, setRaceDrivers] = useState([]);
    const [race, setRace] = useState([]);
    const [raceDrivers, setRaceDrivers] = useState([]);
    const [isDisabledArray, setIsDisabledArray] = useState([]);

    // get drivers info
/*    useEffect(() => {
        socket.on("raceData", (data) => {
            console.log("Received race drivers data:", data);
            setRaceList(data.slice(0, 8)); // max 8 drivers per race todo limit of 8 drivers should be set on the front desk side to handle input validation there
            setIsDisabledArray(Array(8).fill(false)); // initialize all buttons as enabled
        });

        // Clean up the socket listener on unmount
        return () => {
            socket.off("raceData");
        };
    }, []);*/

    useEffect(() => {
        // Fetch the latest race data from the server
        socket.emit("getRaceData");

        // get drivers' info
        const handleRaceData = (data) => {
            console.log("Received race data from server:", data);
            setRaceDrivers(data[0].drivers)
            //setRaceCars(data.slice(0, 8)); // max 8 drivers per race
            // initialize all buttons as enabled initially
            // todo limit of 8 drivers should be set on the front desk side to handle input validation there
            setIsDisabledArray(Array(8).fill(false)); // initialize all buttons as enabled
        };

        socket.on("raceData", handleRaceData);

        return () => {
            socket.off("raceData", handleRaceData);
        };
    }, []);

    console.log(raceDrivers)

    return (
        <div id="observerButtonsGrid">
            {raceDrivers.map((driver, index) => (
                <button id="observerButton"
                        key={index}
                        disabled={isDisabledArray[index]}
                        className="waves-effect waves-light btn-large"
                        onClick={() => {
                            // logic to disable the correct buttons one by one and not all at once
                            const updatedIsDisabledArray = [...isDisabledArray];
                            updatedIsDisabledArray[index] = true;
                            setIsDisabledArray(updatedIsDisabledArray);
                            DriverFinished(() => setIsDisabledArray(updatedIsDisabledArray), index);
                        }}
                >
                    {driver.name}
                </button>
            ))}
        </div>
    )
}

export default LapLineObserver;
