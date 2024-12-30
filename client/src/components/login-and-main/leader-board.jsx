import React, { useEffect, useState } from "react";
import socket from "../../socket.js";
import "./leader-board.css";

function LeaderBoard() {
    const [filteredDrivers, setFilteredDrivers] = useState([]);

    useEffect(() => {
        function handleIncomingRaceData(data) {
            if (data.length !== 0) {
                const updatedDrivers = data[0]["drivers"].map(driver => ({
                    ...driver,
                    fastestLap: driver.fastestLap || null
                }));

                const driversWithTimes = updatedDrivers.filter(driver => driver.fastestLap !== null);

                const sortedDrivers = driversWithTimes.sort((a, b) => {
                    const aTime = a.fastestLap.minutes * 60000 + a.fastestLap.seconds * 1000 + a.fastestLap.milliseconds;
                    const bTime = b.fastestLap.minutes * 60000 + b.fastestLap.seconds * 1000 + b.fastestLap.milliseconds;
                    return aTime - bTime; // Ascending order (fastest first)
                });

                console.log("Sorted drivers:", sortedDrivers);

                const unsortedDrivers = updatedDrivers.filter(driver => driver.fastestLap === null);

                const finalDrivers = [...sortedDrivers, ...unsortedDrivers];
                setFilteredDrivers(finalDrivers);
            } else {
                setFilteredDrivers([]);
            }
        }

        socket.emit("getRaceData");
        socket.on("raceData", handleIncomingRaceData);

        return () => {
            socket.off("raceData", handleIncomingRaceData);
        };
    }, []);

    return (
        <div className="leader-board">
            <h2 className="header">Leaderboard</h2>
            {/*<div className="racersContainer">*/}
                <table className="driver-table">
                    <tbody>
                    <tr className='first-row'>
                        <th className='rank'>Rank</th>
                        <th className='name'>Name</th>
                        <th className='car'>Car</th>
                        <th className='laps'>Laps</th>
                        <th className='best-lap'>Best Lap</th>
                    </tr>
                    {filteredDrivers.map((driver, index) => (
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
                            : <tr key={index} className='next-rows'>
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
                {/*{filteredDrivers.map((driver, index) => (*/}
                {/*    <div key={index} className="driver-container">*/}
                {/*        <p className="driver">Rank: {index + 1}</p>*/}
                {/*        <p className="driver">Name: {driver.name}</p>*/}
                {/*        <p className="driver">Car: {driver.car}</p>*/}
                {/*        <p className="driver">Laps: {driver.lapTimes.length}</p>*/}
                {/*        <p className="driver">*/}
                {/*            Best Lap:{" "}*/}
                {/*            {driver.fastestLap*/}
                {/*                ? `${driver.fastestLap.minutes}:${driver.fastestLap.seconds.toString().padStart(2, '0')}:${driver.fastestLap.milliseconds.toString().padStart(3, '0')}`*/}
                {/*                : "N/A"}*/}
                {/*        </p>*/}
                {/*        /!*<hr />*!/*/}
                {/*    </div>*/}
                {/*))}*/}
            {/*</div>*/}
        </div>
    );
}

export default LeaderBoard;
