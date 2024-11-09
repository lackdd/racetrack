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

socket.on('buttonPressedNotification', () => {
    document.getElementById('message').textContent = 'The button was pressed on the Receptionist page!';
});


// add drivers and car for new race
const inputForm = document.createElement("form");
inputForm.id = 'inputContainer';
const inputField = document.createElement("input")
inputField.type = 'text';
inputField.placeholder = 'Enter your text here';
const inputLabel = document.createElement('label');
inputLabel.innerText = 'Driver name:';
inputLabel.htmlFor = 'userInput';
inputField.id = 'userInput';



const buttonConfirmInput = document.createElement('button');
buttonConfirmInput.id = 'confirmButton';
buttonConfirmInput.innerText = 'Add driver';
buttonConfirmInput.type = 'submit';

inputForm.appendChild(inputLabel);
inputForm.appendChild(inputField);
document.body.appendChild(inputForm);
document.body.appendChild(buttonConfirmInput);

let raceDriversMap = new Map();
let clickCounter = 0;

buttonConfirmInput.addEventListener("click", () => {
    const driverName = inputField.value;
    if (driverName === "") {
        console.log("Please enter driver name")
    } else {
        clickCounter ++;
        console.log('Button clicked!');
        //console.log(driverName);
        //raceDriversMap.set(driverName, { car: clickCounter });
        raceDriversMap.set(driverName, clickCounter);
        inputField.value = "";

        socket.emit('updateRaceDrivers', Array.from(raceDriversMap.entries()));

    }
    console.log(raceDriversMap);
});



// send data to store so race-control can get it
