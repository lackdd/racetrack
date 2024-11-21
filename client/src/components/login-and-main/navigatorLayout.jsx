import {Link} from "react-router-dom";


function NavigatorLayout() {
    return (

        <nav>
            <Link to="/">Home</Link> |
            <Link to="/worker"> Worker</Link> |
            <Link to={'/flagPage'}> Flag</Link> |
            <Link to={'/spectator'}> Spectator</Link> |
            <Link to={'/front-desk'}> (front desk)</Link>
            <Link to={'/race-control'}> (race control)</Link>
            <Link to={'/lap-line-tracker'}> (lap line observer)</Link>
            <Link to={'driver/race-countdown'}> (race countdown)</Link>
            <Link to={'driver/next-race'}> (next race)</Link>
        </nav>
    );
}

export default NavigatorLayout;
