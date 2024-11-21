import { useEffect, useState } from "react";
import "./flagController.css";
import socket from "../../socket.js";

function FlagController() {
    const [flagColour, setFlagColour] = useState("gray");

    useEffect(() => {
        // Track flag changes
        const handleBroadcast = (data) => {
            setFlagColour(convertFlagData(data));
        };

        // Set flag on load
        const setFlagStatusOnLoad = (data) => {
            setFlagColour(convertFlagData(data));
        };

        // Convert flag data to CSS-friendly values
        const convertFlagData = (data) => {
            if (data === "finish") {
                return "finish"; // Special class for chequered flag
            } else if (data === "safe") {
                return "gray";
            } else if (data === "danger") {
                return "red";
            } else if (data === "hazard") {
                return "yellow";
            }
            return data;
        };

        // Listen for broadcasts
        socket.on("broadcastFlagButtonChange", handleBroadcast);

        // Request initial flag status
        socket.emit("FlagPageConnected");
        socket.on("currentFlagStatus", (data) => {
            setFlagStatusOnLoad(data);
        });

        // Clean up listeners on unmount
        return () => {
            socket.off("broadcastFlagButtonChange", handleBroadcast);
            socket.off("currentFlagStatus", setFlagStatusOnLoad);
        };
    }, []);

    // Determine the appropriate CSS class
    const flagClass = flagColour === "finish" ? "chequered-flag" : "";

    return (
        <div>
            <div className="flag-container">
                <div className="pole"></div>
                <div
                    className={`flag ${flagClass}`}
                    style={{
                        background: flagClass ? undefined : `linear-gradient(90deg, ${flagColour}, white)`,
                    }}
                ></div>
            </div>
        </div>
    );
}

export default FlagController;
