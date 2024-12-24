import socket from "../../socket.js";
import { useState, useEffect, useRef } from "react";

function LeaderBoard() {
    const [raceDrivers, setRaceDrivers] = useState([]); // State to store data

    useEffect(() => {


    }, []);

    return (
        <>
            <p>Spectator page! Nothing to show here!</p><ul>

            </ul>
        </>
    );
}

export default LeaderBoard;
