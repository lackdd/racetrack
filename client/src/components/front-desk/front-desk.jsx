import React, { useState, useEffect } from "react";

import socket from "../../socket.js";

function FrontDesk() {
    const [raceDrivers, setRaceDrivers] = useState([]);
    const [driverName, setDriverName] = useState("");
    const [clickCounter, setClickCounter] = useState(0);


    const handleInputChange = (e) => {
        setDriverName(e.target.value);
    };


    const handleSubmit = () => {
        if (driverName.trim() === "") {
            console.log("Please enter a driver name");
            return;
        }


        setClickCounter((prevCounter) => {
            const newClickCounter = prevCounter + 1;

            // update raceDrivers state with functional updates
            setRaceDrivers((prevDrivers) => {
                const updatedDrivers = [...prevDrivers, { name: driverName, counter: newClickCounter }];

                console.log("Emitting updated drivers:", updatedDrivers);
                socket.emit("updateRaceDrivers", updatedDrivers);

                return updatedDrivers; // update state with new drivers
            });

            return newClickCounter;
        });


        setDriverName("");
        console.log("Button clicked!");
    };

    // listen for race drivers data from the server
    useEffect(() => {
        const handleRaceDriversData = (data) => {
            console.log("Received updated race drivers data:", data);
            setRaceDrivers(data); // Update state with server-sent data
        };


        socket.on("raceDriversData", handleRaceDriversData);

        console.log("Active listeners:", socket.listeners("raceDriversData"));


        return () => {
            socket.off("raceDriversData", handleRaceDriversData);
        };
    }, []); // Empty dependency array means this effect runs once on mount

    return (
        <div style={{ textAlign: 'center' }}>
            <h1>Front Desk Interface</h1>
            <div className="row">
                <form className="col s12" onSubmit={(e) => e.preventDefault()}>
                    <div className="row">
                        <div className="input-field col s6">
                            <input
                                placeholder="Race driver name"
                                id="name"
                                type="text"
                                className="validate"
                                value={driverName}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </form>
            </div>
            <button className="btn waves-effect waves-light" type="submit" onClick={handleSubmit}>
                Submit
            </button>
        </div>
    );
}

export default FrontDesk;
