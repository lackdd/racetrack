import { useEffect } from "react";
import "./universal.css"; // Import any necessary styles
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faUpRightAndDownLeftFromCenter} from "@fortawesome/free-solid-svg-icons";

export const FullscreenToggle = () => {
    const toggleFullScreen = () => {
        const mainContainer = document.getElementsByClassName("mainContainer")[0];

        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            mainContainer.requestFullscreen().catch((error) => {
                console.error("Failed to enter fullscreen mode:", error);
            });
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            const fullscreenButton = document.getElementById("fullscreenButton");
            const navContainer = document.getElementsByClassName("navContainer")[0];

            if (document.fullscreenElement) {
                // If in fullscreen mode, hide the fullscreen button and nav container
                if (fullscreenButton) fullscreenButton.classList.add("hidden");
                if (navContainer) navContainer.classList.add("hidden");
            } else {
                // If not in fullscreen mode, show the fullscreen button and nav container
                if (fullscreenButton) fullscreenButton.classList.remove("hidden");
                if (navContainer) navContainer.classList.remove("hidden");
            }
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);

        // Cleanup the event listener on component unmount
        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
        };
    }, []);

    return (
        <button
            id="fullscreenButton-navbar"
            onClick={toggleFullScreen}
            title="Fullscreen Mode"
        >
            <FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter}/>
        </button>
    );
};