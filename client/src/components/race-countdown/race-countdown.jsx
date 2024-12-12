// As a race driver, I want to know when it is my turn to race, so that I can proceed to the paddock.

import socket from "../../socket.js";
import React, {useEffect, useRef, useState} from "react";
import {toggleFullScreen} from "../universal/toggleFullscreen.js";
import {formatLapTime} from "../universal/formatLapTime.js";
import "../universal/universal.css"
import { faUpRightAndDownLeftFromCenter } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon} from "@fortawesome/react-fontawesome";


function RaceCountdown() {
    const [isFlashing, setIsFlashing] = useState(false);
    const [timer, setTimer] = useState(0);
    const [currentRaceName, setCurrentRaceName] = useState("");

    useEffect(() => {

        socket.on("timerUpdate", ({ raceName, timeRemaining }) => { // Destructure the object
            setTimer(timeRemaining);
        });

        return () => {
            socket.off("timerUpdate");
        };
    }, []);

    useEffect(() => {
        // Fetch race data
        socket.emit("getRaceData");

        socket.on("raceData", (data) => {
            const ongoingRace = data.find(race => race.isOngoing === true);
            if (ongoingRace) {
                setCurrentRaceName(ongoingRace.raceName); // Set the raceName of the first ongoing race
            } else {
                setCurrentRaceName(null); // Handle the case where no race is ongoing
            }
        });

        return () => {
            // Clean up listeners for raceData
            socket.off("raceData");
        };
    }, []);
    //

    useEffect(() => {
        if (currentRaceName) {
            socket.emit("getTimeRemaining", currentRaceName, (response) => {
                setTimer(response.timeRemaining);
            });
        }
    }, [currentRaceName]);


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
                onClick={toggleFullScreen}>
                fullscreen
                <FontAwesomeIcon
                    icon={faUpRightAndDownLeftFromCenter}
                    style={{marginLeft: "10px"}} // Add space between text and icon
                />
            </button>
        </div>
    )
}

export default RaceCountdown;
