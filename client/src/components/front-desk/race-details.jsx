import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import socket from "../../socket.js";

function RaceDetails() {
    const { raceName } = useParams(); // Get the race name from the URL
    const [raceDrivers, setRaceDrivers] = useState([]);
    const [driverName, setDriverName] = useState("");
    const [lastAssignedCar, setLastAssignedCar] = useState(0);

    useEffect(() => {
        const handleRaceData = (data) => {
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

    const handleInputChange = (e) => {
        setDriverName(e.target.value);
    };

    const handleAddDriver = () => {
        if (driverName.trim() === "") {
            console.log("Please enter a driver name.");
            return;
        }

        if (raceDrivers.some((driver) => driver.name === driverName)) {
            console.log("Driver name must be unique.");
            return;
        }

        const newDriver = { name: driverName, car: lastAssignedCar + 1 };
        const updatedDrivers = [...raceDrivers, newDriver];

        setLastAssignedCar((prevCar) => prevCar + 1);
        setRaceDrivers(updatedDrivers);
        socket.emit("updateRaceDrivers", { raceName, drivers: updatedDrivers });
        setDriverName("");
    };

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
        </div>
    );
}

export default RaceDetails;
