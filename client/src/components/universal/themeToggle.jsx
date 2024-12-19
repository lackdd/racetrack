import {useEffect, useState} from 'react';
import './universal.css'
import {setTheme} from './themes.js'
import { faSun } from "@fortawesome/free-regular-svg-icons"; // Import the specific icon
import { faMoon } from "@fortawesome/free-regular-svg-icons"; // Import the specific icon
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Import the component


export function ThemeToggle() {
    const [togClass, setTogClass] = useState('dark');
    let theme = localStorage.getItem('theme');

    const handleOnClick = () => {
        if (localStorage.getItem('theme') === 'dark-theme') {
            setTheme('light-theme');
            setTogClass('light');
        } else {
            setTheme('dark-theme');
            setTogClass('dark');
        }
    }

    useEffect(() => {
        if (localStorage.getItem('theme') === 'dark-theme') {
            setTogClass('dark')
        } else if (localStorage.getItem('theme') === 'light-theme') {
            setTogClass('light')
        }
    }, [theme])


    return (
        <div className="container--toggle">
            {
                togClass === "light" ?
                    <button
                        id='themeButton-navbar'
                        onClick={handleOnClick}
                        title='Change theme'>
                        <FontAwesomeIcon icon={faSun}/>
                    </button>
                    :
                    <button
                        id='themeButton-navbar'
                        onClick={handleOnClick}
                        title='Change theme'>
                        <FontAwesomeIcon icon={faMoon}/>
                    </button>
            }
        </div>
    )
}