import { Link, useNavigate } from "react-router-dom";
import "./navigator.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faUpRightAndDownLeftFromCenter} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import {ThemeToggle} from '../universal/themeToggle.jsx'
import {FullscreenToggle} from "../universal/fullscreenToggle.jsx";

function DynamicNavigator({ links, setRole }) {
    const navigate = useNavigate();

    const handleHomeClick = () => {
        setRole(null);
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
            <div className='toggleContainer'>
                {FullscreenToggle()}
                {/*<button*/}
                {/*    id='fullscreenButton-navbar'*/}
                {/*    onClick={toggleFullScreen}*/}
                {/*title='Fullscreen mode'>*/}
                {/*    <FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter}/>*/}
                {/*</button>*/}
                {ThemeToggle()}
            </div>
        </div>

    );
}

export default DynamicNavigator;
