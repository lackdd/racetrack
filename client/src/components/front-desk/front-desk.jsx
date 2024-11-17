import React, { useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5173");

let raceDriversMap = new Map();
let clickCounter = 0;

function FrontDesk() {

    const [driverName, setDriverName] = useState("");
    const [clickCounter, setClickCounter] = useState(0);

    const handleInputChange = (e) => {
        setDriverName(e.target.value);
    };

    const handleSubmit = () => {
        if (driverName.trim() === "") {
            console.log("Please enter driver name again");
            return;
        }

        const newClickCounter = clickCounter + 1;
        setClickCounter(newClickCounter);
        raceDriversMap.set(driverName, newClickCounter);

        socket.emit("updateRaceDrivers", Array.from(raceDriversMap.entries()));

        setDriverName("");

        console.log("Button clicked!");
        console.log(raceDriversMap);
    };

    return (
        <div style={{textAlign: 'center'}}>
            <h1>
                Front Desk Interface
            </h1>
            <div className="row">
                <form className="col s12" onSubmit={(e) => e.preventDefault()}>
                    <div className="row">
                        <div className="input-field col s6">
                            <input placeholder="Race driver name" id="name" type="text" className="validate" value={driverName}
                                   onChange={handleInputChange}/>
                        </div>
                    </div>
                </form>
            </div>
            <button className="btn waves-effect waves-light" type="submit" onClick={handleSubmit}>Submit
            </button>
        </div>
    );
};

export default FrontDesk;
