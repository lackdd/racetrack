import socket from "../../socket.js";
import { useState, useEffect, useRef } from "react";

function Spectator() {
    const [raceDrivers, setRaceDrivers] = useState([]); // State to store data

    useEffect(() => {
        socket.emit("getDataForSpectator", (data) => {
            setRaceDrivers(data);
        });
        socket.on("dataToSpectator", data => setRaceDrivers(data));

        return () => {
            socket.off("dataToSpectator");
        };

    }, []);

    return (
        <>
            <p>Spectator page</p>
            <ul>
                {raceDrivers.map((driver, index) => (
                    <li key={index}>{driver}</li>
                ))}
            </ul>
        </>
    );
}

export default Spectator;
