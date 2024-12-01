import {Link} from "react-router-dom";
import "./navigator.css";

function DynamicNavigator({links}) {
    return (
        <div className='navContainer'>
            {links.map((link, index) => (
                <Link key={index} to={link.to}>{link.label}</Link>
            ))}
        </div>
    )
}

export default DynamicNavigator;