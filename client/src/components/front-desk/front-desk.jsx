import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../../socket.js";
import "./front-desk.css";

function FrontDesk() {
    const [raceName, setRaceName] = useState("");
    const [raceList, setRaceList] = useState([]);
    const [isOngoing, setIsOngoing] = useState(false);
    const [raceStarted, setRaceStarted] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        // Fetch the latest race data from the server when user loads to page
        socket.emit("getRaceData");

        // actively fetch data from server
        const handleRaceData = (data) => {
            console.log("Received race data from server:", data);
            setRaceList(data); // Update race list state
            const ongoingRace = data.find((race) => race.isOngoing === true);
            setRaceStarted(!!ongoingRace);
        };

        socket.on("raceData", handleRaceData);

        // Clean up the socket listener on unmount
        return () => {
            socket.off("raceData", handleRaceData);
        };
    }, []);

    // set race name
    const handleRaceNameChange = (e) => {
        setRaceName(e.target.value);
    };

    // submit new race to server
    const handleRaceSubmit = () => {
        if (raceName.trim() === "") {
            console.log("Please enter a valid race name.");
            return;
        }

        const newRace = { raceName, isOngoing };
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
        <div className="front-desk" style={{ textAlign: "center" }}>
            <h1 className="header">Front Desk Interface</h1>
            { !raceStarted && (
                <>
            <div>
                <input className="input"
                    placeholder="Race name"
                    value={raceName}
                    onChange={handleRaceNameChange}
                />
                <button className="button add-button" onClick={handleRaceSubmit}>Add Race</button>
            </div>
            <ul className="ul">
                {raceList.map((race, index) => (
                    <li key={index}>
                        <button className="button" onClick={() => handleRaceClick(race)}>
                            {race.raceName}
                        </button>
                        <button className="button" onClick={() => handleRaceDelete(race.raceName)}>
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
            </>
            )}
        </div>
    );
}

export default FrontDesk;
