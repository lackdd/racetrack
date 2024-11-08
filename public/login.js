// login.js
export function loadLoginContent() {
    const mainContentArea = document.getElementById('mainContentArea');
    mainContentArea.innerHTML = `
        <h2>Login</h2>
        <form id="loginForm">
  
            <br>
            <label for="password">Password:</label>
            <input type="password" id="password" name="password">
            <br>
            <button type="submit">Login</button>
        </form>
    `;
}
