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
                        <a>front desk</a>
                    </li>
                    <li>
                        <a>race control</a>
                    </li>
                </ul>
            </div>
        </nav>
    );
}

export default Header;
