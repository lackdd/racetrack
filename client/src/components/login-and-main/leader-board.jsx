import { useEffect, useState } from "react";
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
            <h2 className="header">Leader Board</h2>
            <div className="racersContainer">
                {filteredDrivers.map((driver, index) => (
                    <div key={index}>
                        <p className="text">Rank: {index + 1}</p>
                        <p className="text">Name: {driver.name}</p>
                        <p className="text">Car: {driver.car}</p>
                        <p className="text">Laps: {driver.lapTimes.length}</p>
                        <p className="text">
                            Best Lap:{" "}
                            {driver.fastestLap
                                ? `${driver.fastestLap.minutes}:${driver.fastestLap.seconds.toString().padStart(2, '0')}:${driver.fastestLap.milliseconds.toString().padStart(3, '0')}`
                                : "N/A"}
                        </p>
                        <hr />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default LeaderBoard;
