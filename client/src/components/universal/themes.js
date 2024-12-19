
export const setTheme = (themeName) => {
    localStorage.setItem('theme', themeName);
    document.documentElement.className = themeName;
}

export const keepTheme = () => {
    if (localStorage.getItem('theme')) {
        if (localStorage.getItem('theme') === 'dark-theme') {
            setTheme('dark-theme');
        } else if (localStorage.getItem('theme') === 'light-theme') {
            setTheme('light-theme')
        }
    } else {
        setTheme('dark-theme')
    }
}