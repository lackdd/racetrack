import "./racing-panel.css";
import socket from "../../socket.js";
import {useEffect, useState} from "react";
import {Button} from "react-bootstrap";

function RacingPanel() {
    const [allRaceData, setAllRaceData] = useState([]); //All races data
    const [drivers, setDrivers] = useState([]); //Current race all drivers (names and cars)
    const [raceName, setRaceName] = useState("Invalid race name"); //Current race name
    const [currentShownRace, setCurrentShownRace] = useState(0); //What race is shown
    const [raceDataHasData, setRaceDataHasData] = useState(false); //If there is no races at all!
    const [countedLapsData, setCountedLapsData] = useState([]);
    const [fastestLapTimeData, setFastestLapTimeData] = useState([]);

    //Get and update data with socket
    useEffect(() => {
        function handleIncomingRaceData(data) {
            if (data.length !== 0) {
                setAllRaceData(data);
                setDrivers(data[currentShownRace]['drivers']);
                setRaceName(data[currentShownRace]['raceName']);
                setRaceDataHasData(true);
                setCountedLapsData(data[currentShownRace]['finishedLaps']);
            } else {
                setRaceDataHasData(false);
            }
        }

        socket.on('raceData', handleIncomingRaceData);
        socket.emit('getRaceData');
        return () => {
            socket.off('raceData', handleIncomingRaceData);
        };
    }, []);

    //Update data on button click
    useEffect(()=> {
        if (allRaceData.length !== 0) { //To Artur: if page loads, it also runs this code here even if allRaceData hasnt loaded yet and its []. Gives error
            setRaceName(allRaceData[currentShownRace]['raceName']);
            setDrivers(allRaceData[currentShownRace]['drivers']);
        }
    }, [currentShownRace]);


    function nextOrPrevRaceButtonEvent(event){
        if (event.target.value === "next" && currentShownRace !== allRaceData.length - 1) {
            setCurrentShownRace((prev) => prev + 1);
        } else if (event.target.value === "back" && currentShownRace !== 0) {
            setCurrentShownRace((prev) => prev - 1);
        }
    }


    return raceDataHasData ? (
        <div>
            <div className="raceCarTracksContainerNavigator">
                <Button value="back" onClick={nextOrPrevRaceButtonEvent}>Previous race</Button>
                <div>
                    <p>Race name: {raceName}</p>
                    <p>Status:  soon!</p>
                </div>
                <Button value="next" onClick={nextOrPrevRaceButtonEvent}>Next race</Button>
            </div>

            {drivers.map((driver, index) => (
                <div key={index} className="raceCarTracksContainer">
                    <div className="raceTrack">
                        <img className="carImage"
                             src="/car2.png"
                             alt="Picture"
                             style={{ left: `${driver.lapTimes.length * 5}%` }}
                        />
                        <div className="raceRoad"></div>
                    </div>
                    <div className="driverDataContainer"
                         style={{left: `${driver.lapTimes.length * 5}%`}}>
                        <p>{driver.name} (car {driver.car})</p>
                        <p>Laps: {driver.lapTimes.length}</p>
                        {/*<p>Best Lap: {driver.fastestLap || "NA"}</p>*/}
                        {/*<p>
                            Best Lap:
                            {driver.fastestLap.minutes === 0 && driver.fastestLap.seconds === 0 && driver.fastestLap.milliseconds === 0
                                ? "NA" // if minutes, seconds and milliseconds are 0 display NA, otherwise display time
                                : ` ${(driver.fastestLap.minutes || 0).toString().padStart(2, "0")}:` +
                                `${(driver.fastestLap.seconds || 0).toString().padStart(2, "0")}:` +
                                `${(driver.fastestLap.milliseconds || 0).toString().padStart(2, "0")}`}
                        </p>*/}
                    </div>
                </div>
            ))}

        </div>
    ) : (
        <div>
            <p className="noRacesMessage">Races starting soon!</p>
        </div>
    );
}

export default RacingPanel
