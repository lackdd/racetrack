import {Link} from "react-router-dom";


function NavigatorLayout() {
    return (

        <nav>
            <Link to="/">Home</Link> |
            <Link to="/worker"> Worker</Link> |
            <Link to={'/spectator'}> Spectator</Link> |
            <Link to={'/front-desk'}> (front desk)</Link>
            <Link to={'/race-control'}> (race control)</Link>
        </nav>
    );
}

export default NavigatorLayout;