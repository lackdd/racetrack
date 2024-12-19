import { Link, useNavigate } from "react-router-dom";
import "./navigator.css";
import React from "react";
import {ThemeToggle} from '../universal/themeToggle.jsx'
import {FullscreenToggle} from "../universal/fullscreenToggle.jsx";

function DynamicNavigator({ links, setRole }) {
    const navigate = useNavigate();

    const handleHomeClick = () => {
        // setRole(null); commentisin ajutiselt välja, et ei peaks testides iga kord uuesti isse logima ja oleks lihtsam DEV rollina testida asju
        navigate("/");
    };

    return (
        <div className='navContainer'>
            <div className='linksContainer'>
                {links.map((link, index) => (
                    <Link
                        key={index}
                        to={link.to}
                        onClick={link.to === "/" ? handleHomeClick : undefined}
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

    );
}

export default DynamicNavigator;
