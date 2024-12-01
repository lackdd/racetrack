import {BrowserRouter, Routes, Route} from 'react-router-dom';

import RaceDetails from './front-desk/race-details';
import FrontDesk from './front-desk/front-desk.jsx'
import RaceControl from './race-control/race-control.jsx'
import Login from "./login-and-main/login.jsx";
import PageNotFound404 from "./login-and-main/pageNotFound404.jsx";
import Spectator from "./spectator/spectator.jsx";
import LapLineObserver from "./lap-line-tracker/lap-line-observer.jsx";
import "./App.css";
import Flag from "./flag/flag.jsx";
import RaceCountdown from "./race-countdown/race-countdown.jsx"
import NextRace from "./next-race/next-race.jsx";
import DynamicNavigator from "./login-and-main/dynamic-navigator.jsx";

function App() {
    const spectatorLinks = [
        {to: "/", label: "Home"},
        {to: "/worker", label: "Worker"},
        {to: "/spectator", label: "Spectator"},
        {to: "/flag", label: "Flag"}
    ];

    const otherLinks = [
        {to: "/", label: "Home"},
        { to: "/front-desk", label: "Front Desk" },
        { to: "/race-control", label: "Race Control" },
        { to: "/lap-line-tracker", label: "Lap Line Observer" },
        { to: "/driver/race-countdown", label: "Race Countdown" },
        { to: "/driver/next-race", label: "Next Race" },
    ];


    return (
      <div className="mainContainer">
          <div>
              <BrowserRouter>
                  <Routes>
                      {/* Spectator here */}
                      <Route path="/" element={
                          <>
                              <DynamicNavigator links={spectatorLinks} />
                              <p>Main page</p>
                          </>
                      } />

                      <Route path="/worker" element={
                          <>
                              <DynamicNavigator links={spectatorLinks} />
                              <Login />
                          </>
                      } />

                      <Route path="/spectator" element={
                          <>
                              <DynamicNavigator links={spectatorLinks} />
                              <Spectator />
                          </>
                      } />

                      <Route path="/flag" element={
                          <>
                              <DynamicNavigator links={spectatorLinks} />
                              <Flag />
                          </>
                      } />

                      <Route path="*" element={
                          <>
                              <DynamicNavigator links={spectatorLinks} />
                              <PageNotFound404 />
                          </>
                      } />

                      {/* Other links here */}
                      <Route
                          path="/front-desk"
                          element={
                              <>
                                  <DynamicNavigator links={otherLinks} />
                                  <FrontDesk />
                              </>
                          }
                      />
                      <Route
                          path="/front-desk/:raceName"
                          element={
                              <>
                                  <DynamicNavigator links={otherLinks} />
                                  <RaceDetails />
                              </>
                          }
                      />
                      <Route
                          path="/race-control"
                          element={
                              <>
                                  <DynamicNavigator links={otherLinks} />
                                  <RaceControl />
                              </>
                          }
                      />
                      <Route
                          path="/lap-line-tracker"
                          element={
                              <>
                                  {/*<DynamicNavigator links={otherLinks} />*/}
                                  <LapLineObserver />
                              </>
                          }
                      />
                      <Route
                          path="/driver/race-countdown"
                          element={
                              <>
                                  <DynamicNavigator links={otherLinks} />
                                  <RaceCountdown />
                              </>
                          }
                      />
                      <Route
                          path="/driver/next-race"
                          element={
                              <>
                                  <DynamicNavigator links={otherLinks} />
                                  <NextRace />
                              </>
                          }
                      />
                  </Routes>
              </BrowserRouter>

          </div>

      </div>
    )
}

export default App
