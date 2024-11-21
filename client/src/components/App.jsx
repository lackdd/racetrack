import {BrowserRouter, Routes, Route} from 'react-router-dom';

import RaceDetails from './front-desk/race-details';
import Landing from './Landing'
import FrontDesk from './front-desk/front-desk.jsx'
import RaceControl from './race-control/race-control.jsx'
import Login from "./login-and-main/login.jsx";
import NavigatorLayout from "./login-and-main/navigatorLayout.jsx";
import PageNotFound404 from "./login-and-main/pageNotFound404.jsx";
import Spectator from "./spectator/spectator.jsx";
import LapLineObserver from "./lap-line-tracker/lap-line-observer.jsx";
import Flag from "./flag/flag.jsx";
import "./App.css";
import FlagPage from "./flag/flagPage.jsx";
import RaceCountdown from "./race-countdown/race-countdown.jsx"
import NextRace from "./next-race/next-race.jsx";

function App() {
    return (
      <>
          <div className="container">
              <BrowserRouter>
                  {/*Need /lap-line-tracker with only buttons for cars and without any distractions */}
                   {location.pathname !== "/lap-line-tracker" && <NavigatorLayout />}
                  <Routes>
                      <Route path="/" element={<Landing />} />
                      <Route path="/worker" element={<Login />} />
                      <Route path="/flagPage" element={<FlagPage />} />
                      <Route path="/front-desk" element={<FrontDesk />} />
                      <Route path="/front-desk/:raceName" element={<RaceDetails />} />
                      <Route path="/spectator" element={<Spectator />} />
                      <Route path="/race-control" element={<RaceControl />} />
                      <Route path="/lap-line-tracker" element={<LapLineObserver />} />
                      <Route path="/driver/race-countdown" element={<RaceCountdown />} />
                      <Route path="/driver/next-race" element={<NextRace />} />
                      <Route path="*" element={<PageNotFound404 />} />
                  </Routes>
              </BrowserRouter>

          </div>
          {/*Need /lap-line-tracker with only buttons for cars and without any distractions */}
          {location.pathname !== "/lap-line-tracker" &&
              location.pathname !== "/driver/race-countdown" &&
              location.pathname !== "/driver/next-race" && (
              <>
                  <Flag />
                  <p>Flag status here</p>
              </>
          )}
      </>
    )
}

export default App
