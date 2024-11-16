import Dropdown from 'react-bootstrap/Dropdown';
import Form from 'react-bootstrap/Form';
import 'bootstrap/dist/css/bootstrap.min.css';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import {useState} from "react";

function Login() {
    const [optionValue, setOptionValue] = useState("");
    const [passwordValue, setPasswordValue] = useState("");

    function givenPassword(event){
        setPasswordValue(event.target.value)
    }
    function chosenOption(event) {
        setOptionValue(event.target.value);
    }

    function handleLogin(event) {
        event.preventDefault();
        console.log("Login" + optionValue + passwordValue);
    }

    return (
        <>
            <form onSubmit={handleLogin}>
                <FloatingLabel controlId="floatingPassword" label="Password">
                    <Form.Control type="password" placeholder="Password" onChange={givenPassword} />
                </FloatingLabel>

                <Form.Select aria-label="Default select example" onChange={chosenOption}>
                    <option>Open this select menu</option>
                    <option value="Safety official">Safety official</option>
                    <option value="Secretary">Secretary</option>
                    <option value="Racer">Racer</option>
                </Form.Select>
                <button type="submit">Login</button>
            </form>

        </>
    )
}

export default Login;