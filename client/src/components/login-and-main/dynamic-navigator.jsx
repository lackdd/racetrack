import { Link, useNavigate } from "react-router-dom";
import "./navigator.css";
import React, {useState} from "react";
import {ThemeToggle} from '../universal/themeToggle.jsx'
import {FullscreenToggle} from "../universal/fullscreenToggle.jsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBars, faXmark} from "@fortawesome/free-solid-svg-icons";


function DynamicNavigator({ links, setRole }) {
    const navigate = useNavigate();
    const [hamburger, setHamburger] = useState(false);

    const handleHomeClick = () => {
        setRole(null);
        navigate("/");
    };

    return (
        <div className='navContainer'>
            {/* for bigger screens */}
            <div className='desktop-navigator'>
                {/*<div className='home-button-container'>*/}
                {/*    <a href='/' title='Home' className='home-button-desktop'>*/}
                {/*       BEACHSIDE RACETRACK*/}
                {/*    </a>*/}
                {/*</div>*/}
                <div className='home-button-container'>
                    <a href='/' title='Home'>
                        <img src='Beachside_Racetrack_favicon.png' className='nav-logo home-button-desktop'
                             alt='Beachside Racetrack Logo'/>
                    </a>
                </div>
                <div className='linksContainer'>
                    {links.map((link, index) => (
                        <Link
                            key={index}
                            to={link.to}
                            onClick={link.to === '/' ? handleHomeClick : undefined}
                            title={link.title}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
                <div className='settingsContainer'>
                    {FullscreenToggle()}
                    {ThemeToggle()}
                </div>
            </div>

            {/* for smaller screens */}
            <div className='mobile-navigator'>
                <div className='settingsContainer'>
                    {FullscreenToggle()}
                    {ThemeToggle()}
                </div>
                {/*<a className='home-button-mobile' href='/' title='Home'>*/}
                {/*    <FontAwesomeIcon icon={faHouse}/>*/}
                {/*</a>*/}
                <div className='home-button-container'>
                    <a href='/' title='Home'>
                        <img src='Beachside_Racetrack_favicon.png' className='nav-logo home-button-mobile'
                             alt='Beachside Racetrack Logo'/>
                    </a>
                </div>
                <div className='linksContainer'>
                    <button
                        className={`hamburger ${hamburger ? "open" : "closed"}`}
                        title="Menu"
                        onClick={() => setHamburger(!hamburger)}
                    >
                        {hamburger ? (
                            <div className="hamburger-links">
                                {links
                                    .filter(link => link.to !== '/') // Exclude "Home"
                                    .map((link, index) => (
                                        <Link
                                            key={index}
                                            to={link.to}
                                            onClick={link.to === "/" ? handleHomeClick : undefined}
                                            title={link.title ? link.title : ""}
                                        >
                                            {link.title === "Race settings" ? "Race settings" : link.label}
                                        </Link>
                                    ))}
                            </div>
                        ) : (
                            <FontAwesomeIcon icon={faBars}/>
                        )}
                        {hamburger && <FontAwesomeIcon icon={faXmark}/>}
                    </button>
                </div>
            </div>
        </div>

    );
}

export default DynamicNavigator;
