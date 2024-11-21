// As a race driver, I want to know when it is my turn to race, so that I can proceed to the paddock.
function RaceCountdown() {

    let timer = 10 // for testing

    return (
        <div
        style={{fontSize: "2em",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "100%",}}>
            <p>Next race starts in: </p>
                <p> {timer} </p>
        </div>
    )
}

export default RaceCountdown;