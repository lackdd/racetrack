import Form from 'react-bootstrap/Form';
import 'bootstrap/dist/css/bootstrap.min.css';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import {useState} from "react";


function Login() {
    const [optionValue, setOptionValue] = useState("Safety official");
    const [passwordValue, setPasswordValue] = useState("11");
    const [loginStatusText, setLoginStatusText] = useState("");

    function givenPassword(event){
        setPasswordValue(event.target.value);
        console.log(event.target.value + " password given");

    }
    function chosenOption(event) {
        setOptionValue(event.target.value);
        console.log(event.target.value + " option selected");
    }

    function handleLogin(event){
        event.preventDefault();

        const dataToSend = {
            role:optionValue,
            password:passwordValue,
        }
        const fetchOptions = {
            method: "POST",
            headers: {
                'Content-Type': 'application/json', // Inform the server about JSON data
            },
            body: JSON.stringify(dataToSend)
        }

        fetch('http://localhost:3000/api/login', fetchOptions)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json(); // Parse the server's response
            })
            .then((responseData) => {
                switch(responseData.role) {
                    case "Receptionist":
                        window.location.href = "/race-control";
                        break;
                    case "Racer":
                        window.location.href = "/driver/next-race";
                        break;
                    case "Safety official":
                        window.location.href = "/front-desk";
                        break;
                    case "Lap line obs":
                        window.location.href = "/lap-line-tracker";
                        break;
                }

                console.log('Response from server:', responseData);
                setLoginStatusText("");

            })
            .catch((error) => {
                console.error('Error sending data to server:', error);
                setLoginStatusText("Invalid password");
            });
    }

    return (
        <>
            <form onSubmit={handleLogin}>
                <FloatingLabel controlId="floatingPassword" label="Password">
                    <Form.Control type="password" placeholder="Password" onChange={givenPassword} />
                </FloatingLabel>

                <Form.Select aria-label="Default select example" onChange={chosenOption}>
                    <option value="Safety official">Safety official</option>
                    <option value="Receptionist">Receptionist</option>
                    <option value="Racer">Racer</option>
                    <option value="Lap line obs">Lap line obs</option>
                </Form.Select>
                <p>{loginStatusText}</p>
                <button type="submit">Login</button>
            </form>
        </>
    )
}

export default Login;