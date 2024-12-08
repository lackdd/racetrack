import { Link, useNavigate } from "react-router-dom";
import "./navigator.css";

function DynamicNavigator({ links, setRole }) {
    const navigate = useNavigate();

    const handleHomeClick = () => {
        setRole(null);
        navigate("/");
    };

    return (
        <div className='navContainer'>
            {links.map((link, index) => (
                <Link
                    key={index}
                    to={link.to}
                    onClick={link.to === "/" ? handleHomeClick : undefined}
                >
                    {link.label}
                </Link>
            ))}
        </div>
    );
}

export default DynamicNavigator;
