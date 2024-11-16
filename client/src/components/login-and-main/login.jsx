

function Login() {

    function handleLogin(event) {
        event.preventDefault();
        console.log("Login");
    }

    return (
        <>
            <form onSubmit={handleLogin}>
                <p>Password:</p>
                <input type="password"/>

                <input id="radioSafety" name="role" type="radio" value="Safety official"/>
                <label htmlFor="radioSafety">Safety Official</label>
                <br/>
                <input id="radioSecretary" name="role" type="radio" value="Secretary"/>
                <label htmlFor="radioSecretary">Secretary</label>
                <br/>
                <input id="radioRacer" name="role" type="radio" value="Racer"/>
                <label htmlFor="radioRacer">Racer</label>
                <br/>
                <button type="submit">Login</button>
            </form>
        </>
    )
}

export default Login;