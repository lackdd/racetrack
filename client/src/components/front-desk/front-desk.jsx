import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../../socket.js";

function FrontDesk() {
    const [raceName, setRaceName] = useState("");
    const [raceList, setRaceList] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        // Fetch the latest race data from the server
        socket.emit("getRaceData");

        const handleRaceData = (data) => {
            console.log("Received race data from server:", data);
            setRaceList(data); // Update race list state
        };

        socket.on("raceData", handleRaceData);

        return () => {
            socket.off("raceData", handleRaceData);
        };
    }, []);

    const handleRaceNameChange = (e) => {
        setRaceName(e.target.value);
    };

    const handleRaceSubmit = () => {
        if (raceName.trim() === "") {
            console.log("Please enter a valid race name.");
            return;
        }

        const newRace = { raceName };
        socket.emit("createRace", newRace); // Notify the server
        setRaceName("");
    };

    const handleRaceDelete = (raceName) => {
        socket.emit("deleteRace", raceName); // Notify the server to delete the race
    };

    const handleRaceClick = (race) => {
        navigate(`/front-desk/${race.raceName}`); // Route to the specific race page
    };

    return (
        <div style={{ textAlign: "center" }}>
            <h1>Front Desk Interface</h1>
            <div>
                <input
                    placeholder="Race name"
                    value={raceName}
                    onChange={handleRaceNameChange}
                />
                <button onClick={handleRaceSubmit}>Add Race</button>
            </div>
            <h3>Races</h3>
            <ul>
                {raceList.map((race, index) => (
                    <li key={index}>
                        <button onClick={() => handleRaceClick(race)}>
                            {race.raceName}
                        </button>
                        <button onClick={() => handleRaceDelete(race.raceName)}>
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default FrontDesk;
