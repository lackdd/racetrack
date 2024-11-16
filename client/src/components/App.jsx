import {BrowserRouter, Link, Switch, Route} from 'react-router-dom';

import Header from './Header.jsx'
import Landing from './Landing'
import FrontDesk from './front-desk/front-desk.jsx'
import RaceControl from './race-control/race-control.jsx'
import {useEffect, useState} from "react";
import Login from "./login-and-main/login.jsx";
import NavigatorLayout from "./login-and-main/navigatorLayout.jsx";
import PageNotFound404 from "./login-and-main/pageNotFound404.jsx";

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


    return (
      <>
          <div className="container">
              {/*
              <BrowserRouter>
                  <div>
                      <Header/>
                      <Route exact path="/" component={Landing}/>
                      <Route path="/front-desk" component={FrontDesk}/>
                      <Route path="/race-control" component={RaceControl}/>


                      <button onClick={sendDataToServer}>Send Data to Server</button>
                  </div>
              </BrowserRouter>
              */}
              <BrowserRouter>
                  <NavigatorLayout />
                  <Switch>
                      <Route exact path="/" component={Landing}/>
                      <Route path="/worker" component={Login}/>
                      <Route path="/front-desk" component={FrontDesk}/>
                      <Route path="/race-control" component={RaceControl}/>
                      <Route path="*" component={PageNotFound404}/>
                  </Switch>
              </BrowserRouter>


          </div>
      </>
    )
}

export default App
