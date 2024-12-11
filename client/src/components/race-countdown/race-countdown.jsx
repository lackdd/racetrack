// As a race driver, I want to know when it is my turn to race, so that I can proceed to the paddock.

import socket from "../../socket.js";
import React, {useEffect, useRef, useState} from "react";
import {toggleFullScreen} from "../universal/toggleFullscreen.js";
import {formatLapTime} from "../universal/formatLapTime.js";
import "../universal/universal.css"

function RaceCountdown() {
    //const [currentRaceData, setCurrentRaceData] = useState([]); // Store all races and their drivers
    const [raceMode, setRaceMode] = useState("");
    const [isFlashing, setIsFlashing] = useState(false);
    const [timer, setTimer] = useState(0);


    // useEffect(() => {
    //     socket.emit("getRaceData") // todo use different sockets? causes wx proxy error when race ends closing the backend server
    //
    //     socket.on("raceData", (data) => {
    //         try {
    //             updateTimer(data);
    //         } catch (err) {
    //             console.error("Error updating timer:", err);
    //         }
    //
    //     });
    //
    //     // Clean up the socket listener on unmount
    //     return () => {
    //         socket.off("raceData");
    //     };
    // }, [currentRaceData]);
    //
    // function updateTimer(data) {
    //     console.log()
    //     const onGoingRace = data.filter((race) => race.isOngoing === true);
    //     setCurrentRaceData(onGoingRace[0])
    //     if (onGoingRace.length > 0) {
    //         setTimer(onGoingRace[0].timeRemainingOngoingRace);
    //     } else {
    //         console.error("No ongoing race exists.");
    //     }
    //     if (timer % 60000 === 0 && timer !== 600000) {
    //         //setIsFlashing(prevIsFlashing => !prevIsFlashing);
    //         setIsFlashing(true);
    //     } else {
    //         //setIsFlashing(prevIsFlashing => !prevIsFlashing);
    //         setIsFlashing(false)
    //     }
    // }

    // Handle incoming flag changes (race modes) so a race starting triggers the next useEffect to retrieve the timer data from the server
    // useEffect(() => {
    //     socket.emit("broadcastFlagButtonChange");
    //     socket.on("broadcastFlagButtonChange", (newFlagStatus) => {
    //         setRaceMode(newFlagStatus);
    //         console.log("Getting flag status from server")
    //     });
    //
    //     // Clean up the socket listener on unmount
    //     return () => {
    //         socket.off("broadcastFlagButtonChange");
    //     };
    // }, []);

    // Handle incoming race mode changes so a race starting triggers the next useEffect to retrieve the timer data from the server
    useEffect(() => {
        socket.emit("getRaceMode");
        socket.on("raceMode", (newRaceMode) => {
            setRaceMode(newRaceMode);
            console.log("Getting race mode from server")
        });

        // Clean up the socket listener on unmount
        return () => {
            socket.off("raceMode");
        };
    }, []);

    // get the timer data from the server
    useEffect(() => {
        socket.emit("getCurrentRaceTimer")

        socket.on("currentRaceTimer", (data) => {
            if (data !== null) {
                setTimer(data);
            } else {
                setTimer(0);
                console.error("Error updating timer. Resetting...");
            }
        });

        // Clean up the socket listener on unmount
        return () => {
            socket.off("currentRaceTimer");
        };
    }, [raceMode]);


    useEffect(() => {
        if (timer % 60000 === 0 && timer % 60010 === 0 && timer % 60020 === 0 && timer !== 600000) {
            //setIsFlashing(prevIsFlashing => !prevIsFlashing);
            setIsFlashing(true);
        } else {
            //setIsFlashing(prevIsFlashing => !prevIsFlashing);
            setIsFlashing(false)
        }
    }, [timer]);

    const time = formatLapTime(timer);

    return (
        <div className="RaceCountdown">
            <div
                style={{
                    fontSize: "8em",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "100%",
                    fontFamily: "monospace"
                }}>
                {timer === 0 ? (
                    <p style={{color: "black"}}>00:00:00</p>
                ) : timer < 10000 && timer !== 0 ? (
                    <p style={{color: "red"}}>
                        {/*{formatLapTime(timer)}*/}
                        <span style={{width: "2ch"}}>{time.minutes}</span>:
                        <span style={{width: "2ch"}}>{time.seconds}</span>:
                        <span style={{width: "2ch"}}>{time.milliseconds}</span>
                    </p>
                ) : isFlashing ? (
                    <p style={{color: "red"}}>
                        {/*{formatLapTime(timer)}*/}
                        <span style={{width: "2ch"}}>{time.minutes}</span>:
                        <span style={{width: "2ch"}}>{time.seconds}</span>:
                        <span style={{width: "2ch"}}>{time.milliseconds}</span>
                    </p>
                ) : (
                    // <p>{formatLapTime(timer)}</p>
                    <p style={{display: "flex"}}>
                        <span style={{width: "2ch"}}>{time.minutes}</span>:
                        <span style={{width: "2ch"}}>{time.seconds}</span>:
                        <span style={{width: "2ch"}}>{time.milliseconds}</span>
                    </p>
                )}
            </div>
            <button
                id="fullscreenButton"
                onClick={toggleFullScreen}>fullscreen
            </button>
        </div>
    )
}

export default RaceCountdown;
