import Form from 'react-bootstrap/Form';
import 'bootstrap/dist/css/bootstrap.min.css';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import {useState} from "react";
import { useNavigate } from "react-router-dom";

function Login({ setRole }) {
    const [optionValue, setOptionValue] = useState("Safety official");
    const [passwordValue, setPasswordValue] = useState("");
    const [loginStatusText, setLoginStatusText] = useState("");
    const navigate = useNavigate();

    function givenPassword(event) {
        setPasswordValue(event.target.value);
    }

    function chosenOption(event) {
        setOptionValue(event.target.value);
    }

    function handleLogin(event) {
        event.preventDefault();

        const dataToSend = {
            role: optionValue,
            password: passwordValue,
        };

        const fetchOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dataToSend),
        };

        fetch("http://localhost:3000/api/login", fetchOptions)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then((responseData) => {
                setRole(responseData.role);
                switch (responseData.role) {
                    case "Receptionist":
                        navigate("/race-control");
                        break;
                    case "Racer":
                        navigate("/driver/next-race");
                        break;
                    case "Safety official":
                        navigate("/race-control");
                        break;
                    case "Lap line obs":
                        navigate("/lap-line-tracker");
                        break;
                    case "DEV":
                        navigate("/front-desk");
                        break;
                    default:
                        setLoginStatusText("Unknown role");
                }
            })
            .catch((error) => {
                console.error("Error sending data to server:", error);
                setLoginStatusText("Invalid password");
            });
    }

    return (
        <form onSubmit={handleLogin}>
            <FloatingLabel controlId="floatingPassword" label="Password">
                <Form.Control type="password" placeholder="Password" onChange={givenPassword} />
            </FloatingLabel>
            <Form.Select aria-label="Default select example" onChange={chosenOption}>
                <option value="Safety official">Safety official</option>
                <option value="Receptionist">Receptionist</option>
                <option value="Racer">Racer</option>
                <option value="Lap line obs">Lap line obs</option>
                <option value="DEV">DEV mode</option>
            </Form.Select>
            <p>{loginStatusText}</p>
            <button type="submit">Login</button>
        </form>
    );
}

export default Login;
