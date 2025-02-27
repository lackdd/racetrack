import {BrowserRouter, Routes, Route} from 'react-router-dom';

import RaceDetails from './front-desk/race-details';
import FrontDesk from './front-desk/front-desk.jsx'
import RaceControl from './race-control/race-control.jsx'
import Login from "./login-and-main/login.jsx";
import PageNotFound404 from "./login-and-main/pageNotFound404.jsx";

import LapLineObserver from "./lap-line-tracker/lap-line-observer.jsx";
import "./App.css";
import Flag from "./flag/flag.jsx";
import RaceCountdown from "./race-countdown/race-countdown.jsx"
import NextRace from "./next-race/next-race.jsx";
import DynamicNavigator from "./login-and-main/dynamic-navigator.jsx";
import RacingPanel from "./login-and-main/racing-panel.jsx";
import RaceSettings from "./race-settings/race-settings.jsx";
import {useEffect, useState} from "react";
import { keepTheme } from './universal/themes.js'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faGear} from "@fortawesome/free-solid-svg-icons";
import LeaderBoard from './login-and-main/leader-board.jsx';


function App() {
    const [role, setRole] = useState(null); // Track the logged-in role

    useEffect(() => {
        keepTheme(); // track theme
    })
    const spectatorLinks = [
        // { to: "/", label: <FontAwesomeIcon icon={faHouse} /> },
        { to: "/leader-board", label: "Leaderboard" },
        { to: "/race-countdown", label: "Race Countdown" },
        { to: "/next-race", label: "Next Race" },
        { to: "/login", label: "Log in" },
    ];

    const DEVlinks = [
        // { to: "/", label: <FontAwesomeIcon icon={faHouse} /> },
        { to: "/leader-board", label: "Leaderboard" },
        { to: "/front-desk", label: "Front Desk" },
        { to: "/race-control", label: "Race Control" },
        { to: "/lap-line-tracker", label: "Lap Line Observer" },
        { to: "/race-countdown", label: "Race Countdown" },
        { to: "/next-race", label: "Next Race" },
        { to: "/race-flags", label: "Flag" },
        { to: "/race-settings", label: <FontAwesomeIcon icon={faGear} />, title: "Race settings" },
    ];

    const lapLineLinks = [
        // { to: "/", label: <FontAwesomeIcon icon={faHouse} /> },
        { to: "/lap-line-tracker", label: "Lap Line Observer" }
    ];

    const safetyOfficialLinks = [
        // { to: "/", label: <FontAwesomeIcon icon={faHouse} /> },
        { to: "/race-control", label: "Race Control" },
        { to: "/race-countdown", label: "Race Countdown" },
        { to: "/next-race", label: "Next Race" },
    ];

    const receptionistLinks = [
        // { to: "/", label: <FontAwesomeIcon icon={faHouse} /> },
        { to: "/front-desk", label: "Front Desk" },
        { to: "/race-settings", label: <FontAwesomeIcon icon={faGear} />, title: "Race settings" }
    ];

    const racerLinks = [
        // { to: "/", label: <FontAwesomeIcon icon={faHouse} /> },
        { to: "/leader-board", label: "Leaderboard" },
        { to: "/race-countdown", label: "Race Countdown" },
        { to: "/next-race", label: "Next Race" },
    ];

    const getNavigatorLinks = () => {
        if (role === "DEV") {
            return DEVlinks;
        } else if (role === "Lap line obs") {
            return lapLineLinks;
        } else if (role === "Safety official") {
            return safetyOfficialLinks;
        } else if (role === "Receptionist") {
            return receptionistLinks;
        } else if (role === "Racer") {
            return racerLinks;
        }  else {
            return spectatorLinks;
        }
    };

    return (
        <div className="mainContainer">
            <BrowserRouter>
                <DynamicNavigator links={getNavigatorLinks()} />
                <Routes>
                    <Route path="/" element={<RacingPanel />} />
                    <Route path="/login" element={<Login setRole={setRole} />} />
                    <Route path="/lap-line-tracker" element={<LapLineObserver />} />
                    <Route path="/front-desk" element={<FrontDesk />} />
                    <Route path="/front-desk/:raceName" element={<RaceDetails />} />
                    <Route path="/race-control" element={<RaceControl />} />
                    <Route path="/race-countdown" element={<RaceCountdown />} />
                    <Route path="/next-race" element={<NextRace />} />
                    <Route path="/race-flags" element={<Flag />} />
                    <Route path="/leader-board" element={<LeaderBoard />} />

                    <Route path="/race-settings" element={<RaceSettings />} />
                    <Route path="*" element={<PageNotFound404 />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App
