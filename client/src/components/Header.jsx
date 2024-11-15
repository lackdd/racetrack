import { Link } from 'react-router-dom';

function Header() {
    return (
        <nav>
            <div className="nav-wrapper">
                <Link to={'/'} className="left brand-logo">
                    Racetrack
                </Link>
                <ul className="right">
                    <li>
                        <Link to={'/front-desk'}>
                            front desk
                        </Link>
                    </li>
                    <li>
                        <Link to={'/race-control'}>
                            race control
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
}

export default Header;
