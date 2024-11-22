import { Link } from "react-router-dom";
import Dropdown from "react-bootstrap/Dropdown";
import "./navigator.css";

function Navigator() {
    return (
        <nav className='navContainer'>
            <div>
                <Link to="/">Home</Link> |
                <Link to="/worker"> Worker</Link> |
                <Link to="/flagController"> Flag</Link> |
                <Link to="/spectator"> Spectator</Link> |
            </div>
            <div>

                <Dropdown className="dropDownContainer">
                    <Dropdown.Toggle variant="success" id="dropdown-basic">
                        Ajutine lahendus
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        <Dropdown.Item as={Link} to="/front-desk">
                            (Front Desk)
                        </Dropdown.Item>
                        <Dropdown.Item as={Link} to="/race-control">
                            (Race Control)
                        </Dropdown.Item>
                        <Dropdown.Item as={Link} to="/lap-line-tracker">
                            (Lap Line Observer)
                        </Dropdown.Item>
                        <Dropdown.Item as={Link} to="/driver/race-countdown">
                            (Race Countdown)
                        </Dropdown.Item>
                        <Dropdown.Item as={Link} to="/driver/next-race">
                            (Next Race)
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        </nav>
    );
}

export default Navigator;
