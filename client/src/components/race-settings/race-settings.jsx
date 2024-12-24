import React, {useEffect, useRef, useState} from "react";
import './race-settings.scss'
import socket from "../../socket.js";

function RaceSettings() {
    const [raceDuration, setRaceDuration] = useState(null)
    const [durationBetweenRaces, setDurationBetweenRaces] = useState(null)
    const [error, setError] = useState("");

    // const prevRaceDuration = useRef(null);
    // const prevDurationBetweenRaces = useRef(null);

    // Store the previous values whenever raceDuration or durationBetweenRaces changes
    // useEffect(() => {
    //     prevRaceDuration.current = raceDuration;
    // }, [raceDuration]);
    //
    // useEffect(() => {
    //     prevDurationBetweenRaces.current = durationBetweenRaces;
    // }, [durationBetweenRaces]);

    // field to enter how long races last
    // field to enter time between races
    // fields to enter passwords for other roles?
    // developer contacts

    useEffect(() => {

        socket.emit('getRaceSettings');

        socket.on('raceDuration', (raceDurationFromServer) => {
            setRaceDuration(raceDurationFromServer);
        })

        socket.on('durationBetweenRaces', (durationBetweenRacesFromServer) => {
            setDurationBetweenRaces(durationBetweenRacesFromServer);
        })

        return () => {
            socket.off('raceDuration');
            socket.off('durationBetweenRaces');
        }
    }, []);


    // send saved raceDuration and durationBetweenRaces values to server
    const handleSettingsSubmit = (e) => {
        e.preventDefault(); // Prevents page refresh

        if (error === "") {
            // Only emit raceDuration if it's a valid number and not empty
            if (raceDuration && !isNaN(raceDuration) && raceDuration) {
                socket.emit("updateRaceDuration", raceDuration);
            }

            // Only emit durationBetweenRaces if it's a valid number and not empty
            if (durationBetweenRaces && !isNaN(durationBetweenRaces) && durationBetweenRaces) {
                socket.emit("updateDurationBetweenRaces", durationBetweenRaces);
            }

            // prevRaceDuration.current = raceDuration;
            // prevDurationBetweenRaces.current = durationBetweenRaces;

            // Fetch new data from the server to update the inputs with the latest values
            socket.emit('getRaceSettings'); // Emit request to fetch updated settings

            // Optionally, you can also listen for the new data from the server and update the state accordingly
            socket.on('raceDuration', (raceDurationFromServer) => {
                setRaceDuration(raceDurationFromServer); // Convert back to minutes for display
            });

            socket.on('durationBetweenRaces', (durationBetweenRacesFromServer) => {
                setDurationBetweenRaces(durationBetweenRacesFromServer); // Convert back to minutes for display
            });


            e.target.reset(); // Clear the form inputs after submission
            setError("");
            alert("Settings saved!");

            return () => {
                socket.off('raceDuration');
                socket.off('durationBetweenRaces');
            }
        } else {
            alert(error);
            e.target.reset();
        }
    };


    return (
        <form className='RaceSettings' onSubmit={handleSettingsSubmit}>
            <div className='input-field-container'>
                <label className='information' htmlFor='raceDuration'>
                    Race duration (minutes):
                </label>
                <input
                    id = 'raceDuration'
                    className='input-settings'
                    type='number'
                    placeholder={raceDuration ? raceDuration / 1000 / 60 : "0"}
                    // value={raceDuration ? raceDuration / 1000 / 60 : ""}
                    onChange={(e) => {
                        const value = e.target.value.trim();
                        // Update state only if the value is a valid number or non-empty string
                        if (value !== "" && value >= 1 && value <= 100) {
                            setError("");
                            setRaceDuration(value);
                        } else {
                            setError("Please enter a valid time value between 1 and 100 minutes.")
                        }
                    }}
                />
            </div>
            <div className='input-field-container'>
                <label className='information' htmlFor='durationBetweenRaces'>
                    Duration between races (minutes):
                </label>
                <input
                    id='durationBetweenRaces'
                    className='input-settings'
                    type='number'
                    placeholder={durationBetweenRaces ? durationBetweenRaces / 1000 / 60 : "0"}
                    // value={durationBetweenRaces ? durationBetweenRaces / 1000 / 60 : ""}
                    onChange={(e) => {
                        const value = e.target.value.trim();
                        // Update state only if the value is a valid number or non-empty string
                        if (value !== "" && value >= 1 && value <= 100) {
                            setError("");
                            setDurationBetweenRaces(value);
                        } else {
                            setError("Please enter a valid time value between 1 and 100 minutes.")
                        }
                    }}
                />
            </div>
            <button
                type='submit'
                className='save-settings-button'>
                Save changes
            </button>
            <p className='dev-information'>
                Contact developer if you have any trouble:
                <br/>
                beachside-racetrack-dev@madeupemail.com
            </p>
        </form>

    );

}

export default RaceSettings;