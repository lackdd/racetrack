const socket = io();

let backLink = document.createElement('a');
backLink.href = "./";
backLink.id = 'back';
backLink.innerText = "Go back to homepage";
backLink.addEventListener('click', (event) => {
    event.preventDefault(); // Prevent the default anchor behavior,  ei lase muidu homepage-i minna kui lingile vajutada kui seda pole
    console.log("Navigating to Homepage");
    window.location.href = '/';

});


document.body.appendChild(backLink);

let driversList = document.createElement('div');
document.body.appendChild(driversList);

// Function to update the displayed drivers list
function updateDriversList(raceDriversMap) {
    driversList.innerText = `Current driver's list: ${Array.from(raceDriversMap.entries())
        .map(([name, count]) => `${name}: ${count}`)
        .join(', ')}`;
}

// Listen for the initial data from the server
socket.on('raceDriversData', (data) => {
    const raceDriversMap = new Map(data);
    console.log("Received race drivers data from server:", raceDriversMap);
    updateDriversList(raceDriversMap);

    // ekstra kood, kuidas seda datat kasutada
});
