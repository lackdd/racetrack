import React, { useState, useEffect } from "react";

import socket from "../../socket.js";


function RaceControl() {
    const [raceDrivers, setRaceDrivers] = useState([]);

    useEffect(() => {

        socket.on("raceDriversData", (data) => {
            console.log("Received race drivers data:", data);
            setRaceDrivers(data);
        });

        return () => {
            socket.off("raceDriversData");
        };
    }, []);

    return (
        <div style={{textAlign: 'center'}}>
            <h1>
                Race Control Interface
            </h1>
            <h2>Race Drivers List:</h2>
            <ul>
                {raceDrivers.map(([name, counter]) => (
                    <li key={name}>
                        {name} Car: {counter}
                    </li>
                ))}
            </ul>

            <button>Danger!</button>
        </div>
    );
}

export default RaceControl;
