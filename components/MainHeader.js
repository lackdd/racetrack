function loadMainHeader() {
    const mainContainer = document.createElement('div')
    const header = document.createElement('h1');
    const line = document.createElement('hr')
    header.innerText = 'Racetrack Gooo!';
    mainContainer.appendChild(header);
    mainContainer.appendChild(line);

    document.body.prepend(mainContainer); // Adds the header at the top of the body
}
export default loadMainHeader;
