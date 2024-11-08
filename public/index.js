// /front-desk
let frontDeskLink = document.createElement('a');
frontDeskLink.href = "./front-desk";
frontDeskLink.id = 'front-desk';
frontDeskLink.innerText = "Front desk interface";
frontDeskLink.addEventListener('click', (event) => {
        event.preventDefault();
        console.log("Navigating to Front Desk Interface");
        window.location.href = '/front-desk';

    });

document.body.appendChild(frontDeskLink);
