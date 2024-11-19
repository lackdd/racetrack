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


function DriverFinished(setIsDisabled) {
    socket.emit("driver finished"); // emit drivers lap time
    console.log("driver finished")
    setIsDisabled(true); // disable button when clicked
}

function LapLineObserver() {
    const [raceDrivers, setRaceDrivers] = useState([]);
    const [isDisabledArray, setIsDisabledArray] = useState([]);

    useEffect(() => {
        socket.on("raceDriversData", (data) => {
            console.log("Received race drivers data:", data);
            setRaceDrivers(data.slice(0, 8)); // max 8 drivers per race
            setIsDisabledArray(Array(8).fill(false)); // initialize all buttons as enabled
        });

        return () => {
            socket.off("raceDriversData");
        };
    }, []);

    return ( // 1 button for each car. button must have car number on it. Button need to be easily pressed (large)
        <div id="observerButtonsGrid">
            {raceDrivers.map((driver, index) => (
                <button id="observerButton"
                    key={index}
                    disabled={isDisabledArray[index]}
                    className="waves-effect waves-light btn-large"
                    onClick={() => {
                        const updatedIsDisabledArray = [...isDisabledArray];
                        updatedIsDisabledArray[index] = true;
                        setIsDisabledArray(updatedIsDisabledArray);
                        DriverFinished(() => setIsDisabledArray(updatedIsDisabledArray), index);
                    }}
                >
                    {raceDrivers[index][0]} {/*todo change this to use car numbers later*/}
                </button>
            ))}
        </div>
    )
}

export default LapLineObserver;
