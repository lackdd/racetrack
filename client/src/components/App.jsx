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
import {faGear, faHouse} from "@fortawesome/free-solid-svg-icons";

function App() {
    const [role, setRole] = useState(null); // Track the logged-in role

    useEffect(() => {
        keepTheme(); // track theme
    })
    // todo siin samuti mõned routed, mis ei ole first level, aga peaksid olema
    const spectatorLinks = [
        { to: "/", label: <FontAwesomeIcon icon={faHouse} /> },
        { to: "/worker", label: "Worker" },
        { to: "/spectator", label: "Spectator" },
        { to: "/flag", label: "Flag" },
    ];

    const DEVlinks = [
        { to: "/", label: <FontAwesomeIcon icon={faHouse} /> },
        { to: "/front-desk", label: "Front Desk" },
        { to: "/race-control", label: "Race Control" },
        { to: "/lap-line-tracker", label: "Lap Line Observer" },
        { to: "/driver/race-countdown", label: "Race Countdown" },
        { to: "/driver/next-race", label: "Next Race" },
        { to: "/race-settings", label: <FontAwesomeIcon icon={faGear} />, title: "Race settings" },
    ];

    const lapLineLinks = [
        { to: "/", label: <FontAwesomeIcon icon={faHouse} /> },
        { to: "/lap-line-tracker", label: "Lap Line Observer" }
    ];

    const safetyOfficialLinks = [
        { to: "/", label: <FontAwesomeIcon icon={faHouse} /> },
        { to: "/race-control", label: "Race Control" },
        { to: "/driver/race-countdown", label: "Race Countdown" },
        { to: "/driver/next-race", label: "Next Race" },
    ];

    const receptionistLinks = [
        { to: "/", label: <FontAwesomeIcon icon={faHouse} /> },
        { to: "/front-desk", label: "Front Desk" },
        { to: "/race-settings", label: <FontAwesomeIcon icon={faGear} />, title: "Race settings" }
    ];

    const racerLinks = [
        { to: "/", label: <FontAwesomeIcon icon={faHouse} /> },
        { to: "/driver/race-countdown", label: "Race Countdown" },
        { to: "/driver/next-race", label: "Next Race" },
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
                    <Route path="/worker" element={<Login setRole={setRole} />} />
                    <Route path="/lap-line-tracker" element={<LapLineObserver />} />
                    <Route path="/front-desk" element={<FrontDesk />} />
                    <Route path="/front-desk/:raceName" element={<RaceDetails />} />
                    <Route path="/race-control" element={<RaceControl />} />
                    <Route path="/driver/race-countdown" element={<RaceCountdown />} />
                    <Route path="/driver/next-race" element={<NextRace />} />
                    <Route path="/flag" element={<Flag />} />

                    <Route path="/race-settings" element={<RaceSettings />} />
                    <Route path="*" element={<PageNotFound404 />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App