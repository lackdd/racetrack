import React, {useState, useEffect} from "react";
import {useParams} from "react-router-dom";
import {useNavigate} from 'react-router-dom';
import socket from "../../socket.js";
import "./front-desk.css";

function RaceDetails() {
    const {raceName} = useParams(); // Get the race name from the URL
    const [raceDrivers, setRaceDrivers] = useState([]);
    const [driverName, setDriverName] = useState("");
    const [carName, setCarName] = useState("");
    const [lastAssignedCar, setLastAssignedCar] = useState(0);
    const [editValues, setEditValues] = useState({});
    const navigate = useNavigate();

    // get the current race data from the server
    useEffect(() => {
        // Fetch the latest race data from the server when user loads to page
        socket.emit("getRaceData");
        socket.emit("getLastAssignedCar");

        const handleRaceData = (data) => {
            const race = data.find((race) => race.raceName === raceName);
            if (race) {
                setRaceDrivers(race.drivers || []);
            }
        };

        const handleLastAssignedCar = (data) => {
            setLastAssignedCar(data);
        }

        socket.on("raceData", handleRaceData);
        socket.on("lastAssignedCar", handleLastAssignedCar);

        return () => {
            socket.off("raceData", handleRaceData);
            socket.off("lastAssignedCar", handleLastAssignedCar);
        };
    }, [raceName, lastAssignedCar]);

    // handle input change event for driver name
    const handleInputChange = (e) => {
        setDriverName(e.target.value);
    };

    const handleCarInputChange = (e) => {
        setCarName(e.target.value);
    };

    const handleEditInputChange = (e, name) => {
        const {value} = e.target;
        setEditValues((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // add driver and do input validation
    const handleAddDriver = () => {
        if (raceDrivers.length >= 8) {
            console.log("Race drivers spots are filled already");
            return;
        }

        if (driverName.trim() === "") {
            console.log("Please enter a driver name.");
            return;
        }

        if (carName.trim() === "") {
            console.log("Please enter a car name.");
            return;
        }

        if (raceDrivers.some((driver) => driver.name === driverName)) {
            console.log("Driver name must be unique.");
            return;
        }

        if (raceDrivers.some((driver) => driver.car === carName)) {
            console.log("Car name must be unique.");
            return;
        }

        const newDriver = {
            name: driverName, car: carName,
            currentLap: 0,
            lapTimes: [],
            lapTimesMS: [],
            fastestLap: null
        };

        const updatedDrivers = [...raceDrivers, newDriver];

        setLastAssignedCar((prevCar) => prevCar + 1);
        socket.emit("updateLastAssignedCar", lastAssignedCar + 1);
        setRaceDrivers(updatedDrivers);
        socket.emit("updateRaceDrivers", {raceName, drivers: updatedDrivers});
        setDriverName("");
        setCarName("");
    };

    // remove driver from race data and server
    const handleRemoveDriver = (driverName) => {
        const updatedDrivers = raceDrivers.filter((driver) => driver.name !== driverName);
        setRaceDrivers(updatedDrivers);
        socket.emit("updateRaceDrivers", {raceName, drivers: updatedDrivers});
    };

    const handleEditDriver = (originalName) => {
        const updatedName = editValues[originalName];
        const nameAlreadyExists = raceDrivers.some((driver) => driver.name === updatedName);
        if (updatedName === "") {
            console.log("Driver name can't be empty.");
            return;
        }

        if (nameAlreadyExists) {
            console.log(`Driver name "${updatedName}" already exists.`);
            return;
        }

        const updatedDrivers = raceDrivers.map((driver) => {
            if (driver.name === originalName) {
                return {...driver, name: updatedName};
            }
            return driver;
        });

        setRaceDrivers(updatedDrivers);
        socket.emit("updateRaceDrivers", {raceName, drivers: updatedDrivers});
    };

    return (
        <div className="front-desk" style={{textAlign: "center"}}>
            <h1 className="header">Race: {raceName}</h1>
            <div>
                <input className="input"
                       placeholder="Driver name"
                       value={driverName}
                       onChange={handleInputChange}
                />
                <input className="input"
                       placeholder="Car name"
                       value={carName}
                       onChange={handleCarInputChange}
                />
                <button className="button" onClick={handleAddDriver}>Add Driver</button>
            </div>
            <ul className="ul">
                {raceDrivers.map((driver, index) => (
                    <li key={index}>
                        <span className="driver-details">
                            {driver.name} - Car {driver.car}
                        </span>
                        <input className="input race-details-input"
                               placeholder="Edit driver name"
                               value={editValues[driver.name] || ""}
                               onChange={(e) => handleEditInputChange(e, driver.name)}
                        />
                        <button className="button race-details-button"
                                onClick={() => handleEditDriver(driver.name)}>Edit
                        </button>
                        <button className="button race-details-button"
                                onClick={() => handleRemoveDriver(driver.name)}>Remove
                        </button>
                    </li>
                ))}
            </ul>
            <button className="button go-back-button" onClick={() => navigate('/front-desk')}>
                Go back
            </button>
        </div>
    );
}

export default RaceDetails;
