const socket = io();

let backLink = document.createElement('a');
backLink.href = "./";
backLink.id = 'back';
backLink.innerText = "Go back to homepage";
backLink.addEventListener('click', (event) => {
    console.log("Navigating to Homepage");
    window.location.href = '/';

});


document.body.appendChild(backLink);
