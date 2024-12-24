// As a race driver, I want to know which car I am assigned to, so that I can see my individual lap times.
// Race drivers must be able to see a list of drivers for the next race session, as well as what cars they are assigned to drive.

// when race mode changes to "danger" ->
// The Next Race screen now displays the current session's drivers,
// and displays an extra message to tell them to proceed to the paddock.

// when race mode changes to "safe" ->
// The Next Race screen switches to the subsequent race session.
import React, { useState, useEffect } from "react";
import socket from "../../socket.js";
// import {formatLapTime} from "../universal/formatLapTime.js";
import "../universal/universal.css"
import "./next-race.css"


function NextRace() {
    const [raceMode, setRaceMode] = useState("");
    const [raceData, setRaceData] = useState([]); // Store all races and their drivers
    const [currentRace, setCurrentRace] = useState(null);  // store current race data
    const [nextRace, setNextRace] = useState(null); // store next race data
    const [queuePos, setQueuePos] = useState();
    const [areAllRacesFinished, setAreAllRacesFinished] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState();
    const [isOnGoing, setIsOnGoing] = useState(false);

        //get the timer data from the server
    // useEffect(() => {
    //     socket.emit("getCurrentRaceTimer")
    //
    //     socket.on("currentRaceTimer", (data) => {
    //         if (data !== null) {
    //             setTimeRemaining(data);
    //         } else {
    //             setTimeRemaining(0);
    //             console.error("Error updating timer. Resetting...");
    //         }
    //     });
    //
    //     // Clean up the socket listener on unmount
    //     return () => {
    //         socket.off("currentRaceTimer");
    //     };
    // }, []);

    useEffect(() => {
        socket.emit("flagButtonWasClicked");

        socket.on("broadcastFlagButtonChange", (newFlagStatus) => {
            // console.log(timeRemaining)
            if ((newFlagStatus === "danger" ||  newFlagStatus === "")) { // display current race's drivers and an extra message to proceed to the paddock
                // console.log(timeRemaining)
                console.log("set flag status to danger")
                setRaceMode("danger");
            }
            if ((newFlagStatus === "start" || newFlagStatus === "safe")) { // display subsequent race session
                // console.log(timeRemaining)
                console.log("set flag status to safe")
                setRaceMode("safe");
            }
            console.log("Getting flag status from server: " + newFlagStatus);
        });

        // Clean up the socket listener on unmount
        return () => {
            socket.off("broadcastFlagButtonChange");
        };
    }, [isOnGoing, raceMode]);

    useEffect(() => {
        socket.emit("getQueuePosition")
        socket.emit("getAreAllRacesFinished")

        socket.on("queuePosition", queuePosition => {
            console.log("Queue position received: ", queuePosition);
            setQueuePos(queuePosition);
        });

        socket.on("areAllRacesFinished", areAllRacesFinished => {
            console.log("AreAllRacesFinished received: ", areAllRacesFinished);
            setAreAllRacesFinished(areAllRacesFinished);
        });

        // Clean up the socket listener on unmount
        return () => {
            socket.off("queuePosition");
            socket.off("areAllRacesFinished");
        };

    },[]);

    useEffect(() => {
        if (areAllRacesFinished) {
            setCurrentRace(null);
            setNextRace(null);
        } else if (queuePos === -1 && !areAllRacesFinished) {
                // No race has started, show first race (if any)
                setCurrentRace(raceData[0] || null);
                setNextRace(raceData[1] || null);
        } else {
                // Display current and next races based on queue position
                setCurrentRace(raceData[queuePos] || null);
                setNextRace(raceData[queuePos + 1] || null);
        }
    }, [areAllRacesFinished, queuePos, raceData]);

    // useEffect(() => {
    //     console.log("Current race data:");
    //     console.log(currentRace);
    //     console.log("Next race data:");
    //     console.log(nextRace)
    // }, [raceMode]);
    //
    //
    // useEffect(() => {
    //     console.log("isOnGoing");
    //     console.log(isOnGoing);
    // }, [isOnGoing]);


    // Fetch race data
    useEffect(() => {
        // if (raceStarted) {
        socket.emit("getRaceData");

        socket.on("raceData", (data) => {
            console.log("New data fetched");

            const onGoingRace = data.find((race) => race.isOngoing === true)

            setIsOnGoing(!!onGoingRace)

            if (raceData !== data) {
                setRaceData(data);
            }

            });


        // Clean up the socket listener on unmount
        return () => {
            socket.off("raceData");
        };
    }, [raceMode]);

    // todo when race mode changes to danger in the middle of the races then the screen shouldn't change
    return (
        <div className="NextRace">
            {currentRace ? (
                raceMode === "danger" && !isOnGoing ? (
                    <>
                        <p className="text raceName"> Next race: {currentRace.raceName}</p>
                        <p className="text paddock blinking">Move to the paddock!</p>
                        <table className="driverTable" id="currentRace">
                            <tbody>
                            <tr>
                            <th className="driver">Driver</th>
                                <th className="car">Car</th>
                                {/*<td>Status</td>*/}
                            </tr>
                            {currentRace.drivers.map((driver, index) => (
                                <tr key={index}>
                                    <td>{driver.name}</td>
                                    <td className="car" >{driver.car}</td>
                                    {/*<td>ok</td>*/}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </>
                ) : isOnGoing && nextRace ? (
                        <>
                            <p className="text raceName"> Next race: {nextRace.raceName}</p>
                            <table className="driverTable" id="nextRace">
                                <tbody>
                                <tr>
                                    <th className="driver">Driver</th>
                                    <th className="car">Car</th>
                                    {/*<td>Status</td>*/}
                                </tr>
                                {nextRace.drivers.map((driver, index) => (
                                    <tr key={index}>
                                        <td className="driver">{driver.name}</td>
                                        <td className="car">{driver.car}</td>
                                        {/*<td>ok</td>*/}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </>
                    )
                    : (
                        <p className="information">Next race has not been submitted</p>
                )
            )
                : (
                    <p className="information" >No races have been submitted</p>
                )}
        </div>
    );
}

export default NextRace;
