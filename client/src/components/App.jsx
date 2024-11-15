import { BrowserRouter, Route } from 'react-router-dom';


import Header from './Header.jsx'
import Landing from './Landing'
import {useEffect, useState} from "react";
const frontDesk = () => <h2>Front Desk Interface</h2>
const raceControl = () => <h2>Race Control Interface</h2>

function App() {

    const sendDataToServer = () => {
        const data = {
            name: 'John Doe',
            age: 30,
            message: 'Hello from the frontend!'
        };

        fetch('http://localhost:3000/api/data', { // https://intimate-upright-sunfish.ngrok-free.app/api/data
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data), // Convert the data to JSON
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((responseData) => {
                console.log('Response from server:', responseData);
            })
            .catch((error) => {
                console.error('Error sending data to server:', error);
            });
    };


/*    useEffect(() => {
        // Fetch the message from the backend
        fetch('http://localhost:4000/api/message')
            .then((response) => response.json())
            .then((data) => {
                console.log(data.message); // Print the message in the browser console
            })
            .catch((error) => console.error('Error fetching data:', error));
    }, []);*/



    return (
      <>
          <div className="container">
              <BrowserRouter>
                  <div>
                      <Header/>
                      <Route exact path="/" component={Landing}/>
                      <Route path="/front-desk" component={frontDesk}/>
                      <Route path="/race-control" component={raceControl}/>
                      <button onClick={sendDataToServer}>Send Data to Server</button>
                  </div>
              </BrowserRouter>

          </div>
      </>
    )
}

export default App
