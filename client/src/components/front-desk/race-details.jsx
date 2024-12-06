import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Link } from 'react-router-dom';
import socket from "../../socket.js";

function RaceDetails() {
    const { raceName } = useParams(); // Get the race name from the URL
    const [raceDrivers, setRaceDrivers] = useState([]);
    const [driverName, setDriverName] = useState("");
    const [lastAssignedCar, setLastAssignedCar] = useState(0);

    // get the current race data from the server
    useEffect(() => {
        // Fetch the latest race data from the server when user loads to page
        socket.emit("getRaceData");

        const handleRaceData = (data) => {
            console.log("Received race data from server:", data);
            const race = data.find((race) => race.raceName === raceName);
            if (race) {
                setRaceDrivers(race.drivers || []);
            }
        };

        socket.on("raceData", handleRaceData);

        return () => {
            socket.off("raceData", handleRaceData);
        };
    }, [raceName]);

    // handle input change event for driver name
    const handleInputChange = (e) => {
        setDriverName(e.target.value);
    };

    // add driver and do input validation
    const handleAddDriver = () => {
        if (driverName.trim() === "") {
            console.log("Please enter a driver name.");
            return;
        }

        if (raceDrivers.some((driver) => driver.name === driverName)) {
            console.log("Driver name must be unique.");
            return;
        }

        const newDriver = { name: driverName, car: lastAssignedCar + 1,
            finishedLaps: 0,
            lapTimes: [],
            lapTimesMS: [],
            fastestLap: null};

        const updatedDrivers = [...raceDrivers, newDriver];

        setLastAssignedCar((prevCar) => prevCar + 1);
        setRaceDrivers(updatedDrivers);
        socket.emit("updateRaceDrivers", { raceName, drivers: updatedDrivers });
        setDriverName("");
    };

    // remove driver from race data and server
    const handleRemoveDriver = (driverName) => {
        const updatedDrivers = raceDrivers.filter((driver) => driver.name !== driverName);
        setRaceDrivers(updatedDrivers);
        socket.emit("updateRaceDrivers", { raceName, drivers: updatedDrivers });
    };

    return (
        <div style={{ textAlign: "center" }}>
            <h1>Race: {raceName}</h1>
            <div>
                <input
                    placeholder="Driver name"
                    value={driverName}
                    onChange={handleInputChange}
                />
                <button onClick={handleAddDriver}>Add Driver</button>
            </div>
            <h2>Drivers</h2>
            <ul>
                {raceDrivers.map((driver, index) => (
                    <li key={index}>
                        {driver.name} - Car {driver.car}
                        <button onClick={() => handleRemoveDriver(driver.name)}>Remove</button>
                    </li>
                ))}
            </ul>
            <Link to={'/front-desk'}>
                Go back
            </Link>
        </div>
    );
}

export default RaceDetails;
