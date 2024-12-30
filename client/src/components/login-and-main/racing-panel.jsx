import "./racing-panel.css";
import socket from "../../socket.js";
import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import {formatLapTime} from '../universal/formatLapTime.js';
import RaceCountdown from "../race-countdown/race-countdown.jsx"

function RacingPanel() {
    const [raceData, setRaceData] = useState([]); // All races data
    const [drivers, setDrivers] = useState([]); // Current race all drivers
    const [currentShownRace, setCurrentShownRace] = useState(""); // Shown race name
    const [raceDataHasData, setRaceDataHasData] = useState(""); // If there are no races

    const [flagStatus, setFlagStatus] = useState("safe")


    const [activeRace, setActiveRace] = useState("no race")


    // Get and update data with socket
    useEffect(() => {
        function handleIncomingRaceData(data) {
            if (data.length !== 0) {
                setRaceData(data);
                setDrivers(data[0]["drivers"]);
                setRaceDataHasData("");
                setActiveRace(data[0]["raceName"]);
            } else {
                setRaceData([]);
                setCurrentShownRace(null);
                setDrivers([]);
                setRaceDataHasData("No races happening!");
            }
        }

        function handleFlagStatus(status) {
            setFlagStatus(status);
        }



        socket.emit("getRaceData");
        socket.emit("getQueuePosition");
        socket.emit("FlagPageConnected");

        socket.on("raceData", handleIncomingRaceData);
        socket.on("broadcastFlagButtonChange", handleFlagStatus);

        return () => {
            socket.off("raceData", handleIncomingRaceData);
            socket.off("broadcastFlagButtonChange", handleFlagStatus);

        };
    }, []);

    // Update displayed drivers when raceData changes
    useEffect(() => {
        if (currentShownRace) {
            const updatedRace = raceData.find((race) => race.raceName === currentShownRace.raceName);

            if (updatedRace) {
                setDrivers(updatedRace.drivers);
            }
        }
    }, [raceData, currentShownRace]);


    function handleButtonEvent(race) {
        setCurrentShownRace(race);
        setDrivers(race.drivers);
    }

    return (
        <div className="racing-panel">
            {activeRace === "no race" ? (
                <div className='no-race-container'>
                    <h1 className='welcome'>Welcome to Beachside Racetrack!</h1>
                    <p className='no-races'>No active races</p>
                </div>

            ) : (
                <>

    <div className='race-buttons-container'>
        {raceData.map((race, index) => (
            <Button key={index} onClick={() => handleButtonEvent(race)}>
                {race.raceName}
            </Button>
        ))}
    </div>

    <div className='race-info-container'>
        <div className='countdown-container'>
            <RaceCountdown/>
        </div>
        <div className='flag-status-container'>
            <p className={`flag-status-info ${flagStatus !== 'safe' ? 'warning' : ''}`}>
                {flagStatus}
            </p>
        </div>
    </div>

    <div className='leader-board'>
        <table className='driver-table'>
            <tbody>
            <tr className='first-row'>
                <th className='rank'>Rank</th>
                <th className='name'>Name</th>
                <th className='car'>Car</th>
                <th className='laps'>Laps</th>
                <th className='best-lap'>Best Lap</th>
            </tr>
            {drivers.map((driver, index) => (
                index === 0 ?
                    <tr key={index} className='next-rows first-place'>
                        <td>{index + 1}</td>
                        <td>{driver.name}</td>
                        <td>{driver.car}</td>
                        <td>{driver.lapTimes.length}</td>
                        <td className='lap-time'>{driver.fastestLap
                            ? `${driver.fastestLap.minutes}:${driver.fastestLap.seconds.toString().padStart(2, '0')}:${driver.fastestLap.milliseconds.toString().padStart(3, '0')}`
                            : 'N/A'}
                        </td>
                    </tr>
                    :
                    <tr key={index} className='next-rows'>
                        <td>{index + 1}</td>
                        <td>{driver.name}</td>
                        <td>{driver.car}</td>
                        <td>{driver.lapTimes.length}</td>
                        <td className='lap-time'>{driver.fastestLap
                            ? `${driver.fastestLap.minutes}:${driver.fastestLap.seconds.toString().padStart(2, '0')}:${driver.fastestLap.milliseconds.toString().padStart(3, '0')}`
                            : 'N/A'}
                        </td>
                    </tr>
            ))}
            </tbody>
        </table>
    </div>
</>
)}
</div>
);

}

export default RacingPanel;
