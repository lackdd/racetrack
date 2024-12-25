import React, {useEffect, useState} from 'react';
import './race-settings.scss';
import socket from '../../socket.js';

function RaceSettings() {
	const [raceDuration, setRaceDuration] = useState(null);
	const [durationBetweenRaces, setDurationBetweenRaces] = useState(null);
	const [error, setError] = useState('');

	useEffect(() => {

		socket.emit('getRaceSettings');

		socket.on('raceDuration', (raceDurationFromServer) => {
			setRaceDuration(raceDurationFromServer);
		});

		socket.on('durationBetweenRaces', (durationBetweenRacesFromServer) => {
			setDurationBetweenRaces(durationBetweenRacesFromServer);
		});

		return () => {
			socket.off('raceDuration');
			socket.off('durationBetweenRaces');
		};
	}, []);


	// send saved raceDuration and durationBetweenRaces values to server
	const handleSettingsSubmit = (e) => {
		e.preventDefault(); // Prevents page refresh

		if (error === '') {
			// Only emit raceDuration if it's a valid number and not empty
			if (raceDuration && !isNaN(raceDuration) && raceDuration) {
				socket.emit('updateRaceDuration', raceDuration);
			}

			// Only emit durationBetweenRaces if it's a valid number and not empty
			if (durationBetweenRaces && !isNaN(durationBetweenRaces) && durationBetweenRaces) {
				socket.emit('updateDurationBetweenRaces', durationBetweenRaces);
			}

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
			setError('');
			alert('Settings saved!');

			return () => {
				socket.off('raceDuration');
				socket.off('durationBetweenRaces');
			};
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
					id='raceDuration'
					className='input-settings'
					type='number'
					placeholder={raceDuration ? raceDuration / 1000 / 60 : '0'}
					onChange={(e) => {
						const value = e.target.value.trim();
						// Update state only if the value is a valid number or non-empty string
						if (value !== '' && value >= 1 && value <= 100) {
							setError('');
							setRaceDuration(value * 60 * 1000);
						} else {
							setError('Please enter a valid time value between 1 and 100 minutes.');
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
					// placeholder={durationBetweenRaces ? durationBetweenRaces / 1000 / 60 : "0"}
					placeholder='not used'
					onChange={(e) => {
						const value = e.target.value.trim();
						// Update state only if the value is a valid number or non-empty string
						if (value !== '' && value >= 1 && value <= 100) {
							setError('');
							setDurationBetweenRaces(value * 60 * 1000);
						} else {
							setError('Please enter a valid time value between 1 and 100 minutes.');
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
