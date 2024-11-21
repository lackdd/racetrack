
// As a race driver, I want to know which car I am assigned to, so that I can see my individual lap times.
// Race drivers must be able to see a list of drivers for the next race session, as well as what cars they are assigned to drive.

// when race mode changes to "danger" ->
// The Next Race screen now displays the current session's drivers,
// and displays an extra message to tell them to proceed to the paddock.

// when race mode changes to "safe" ->
// The Next Race screen switches to the subsequent race session.

function NextRace() {



    return (
        <div
        style={{display: "flex", flexDirection: "column"}}>
            <p>You car:</p>
            <p>You lap times: </p>
        </div>


    )
}

export default NextRace;