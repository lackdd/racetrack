// Function to toggle fullscreen mode
export const toggleFullScreen = () => {
    const mainContainer = document.getElementsByClassName("mainContainer")[0];

    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        mainContainer.requestFullscreen().catch((error) => {
            console.error("Failed to enter fullscreen mode:", error);
        });
    }
};

// Event listener to handle fullscreen changes
document.addEventListener("fullscreenchange", () => {
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
});