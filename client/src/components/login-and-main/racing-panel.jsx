import "./racing-panel.css";
import socket from "../../socket.js";
import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";


function RacingPanel() {
    const [raceData, setRaceData] = useState([]); // All races data
    const [drivers, setDrivers] = useState([]); // Current race all drivers
    const [currentShownRace, setCurrentShownRace] = useState(""); // Shown race name
    const [raceDataHasData, setRaceDataHasData] = useState(""); // If there are no races

    const [flagStatus, setFlagStatus] = useState("safe")
    const [timer, setTimer] = useState(null);

    const [activeRaceIndex, setActiveRaceIndex] = useState(0);
    const [activeRace, setActiveRace] = useState("no race")

    // Get and update data with socket
    useEffect(() => {
        function handleIncomingRaceData(data) {
            if (data.length !== 0) {
                setRaceData(data);
                setDrivers(data[0]["drivers"]);
                setRaceDataHasData("");
            } else {
                setRaceData([]);
                setCurrentShownRace(null);
                setDrivers([]);
                setRaceDataHasData("No races happening!");
            }
        }

        function handleIncomingRaceTime(timerValue) {
            setTimer(timerValue);
        }

        function handleFlagStatus(status) {
            setFlagStatus(status);
        }

        function handleQueuePosition(position) {
            setActiveRaceIndex(position);

            console.log("Hello", raceData.length, position);
            if (raceData.length > 0 && position !== -1) {
                setActiveRace(raceData[activeRaceIndex].raceName);
            } else {
                setActiveRace("no race");
            }
        }

        socket.emit("getRaceData");
        socket.emit("getCurrentRaceTimer");
        socket.emit("getQueuePosition");
        socket.emit("FlagPageConnected");

        socket.on("raceData", handleIncomingRaceData);
        socket.on("currentRaceTimer", handleIncomingRaceTime);
        socket.on("broadcastFlagButtonChange", handleFlagStatus);
        socket.on("queuePosition", handleQueuePosition);

        return () => {
            socket.off("raceData", handleIncomingRaceData);
            socket.off("currentRaceTimer", handleIncomingRaceTime);
            socket.off("broadcastFlagButtonChange", handleFlagStatus);
            socket.off("queuePosition", handleQueuePosition);
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
        <div>
            <div>
                <p>Flag status: {flagStatus}</p>
                <p>Active race: {activeRace}</p>
                <p>Timer: {timer}</p>
            </div>
            <p>{raceDataHasData}</p>
            <div className="checkRaceButtonsContainer">
                {raceData.map((race, index) => (
                    <Button key={index} onClick={() => handleButtonEvent(race)}>
                        {race.raceName}
                    </Button>
                ))}
            </div>

            <div className="racersContainer">
                {drivers.map((driver, index) => (
                    <div key={index}>
                        <p>Name: {driver.name}</p>
                        <p>Car: {driver.car}</p>
                        <p>Laps: {driver.lapTimes.length}</p>
                        <p>
                            Best Lap:{" "}
                            {driver.fastestLap
                                ? `${driver.fastestLap.minutes}:${driver.fastestLap.seconds}:${driver.fastestLap.milliseconds}`
                                : "NA"}
                        </p>
                        <hr/>
                    </div>
                ))}
            </div>
        </div>
    )

}

export default RacingPanel;
