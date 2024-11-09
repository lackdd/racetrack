// loginView.js
export function loadLoginContent() {
    const mainContentArea = document.getElementById('mainContentArea');
    mainContentArea.innerHTML = `
   <h2>Login</h2>
        <form id="loginForm">
            <label for="password">Password:</label>
            <input type="password" id="accessKey" name="password">
            <br>
            <button type="submit">Login</button>
            <p id="errorMessage" style="color: red;"></p> 
        </form>
    `;


    // Add event listener for form submission AFTER form is added to DOM
    document.getElementById("loginForm").addEventListener("submit", async (event) => {
        event.preventDefault();
        const accessKey = document.getElementById("accessKey").value;
        console.log("key " + accessKey);

        try {
            // Send access key to the server for verification
            const response = await fetch("/login/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accessKey })
            });

            console.log("response " + response);

            if (response.ok) {
                window.location.href = "/front-desk";
            } else {
                document.getElementById("errorMessage").textContent = "Invalid access key. Please try again.";
            }
        } catch (error) {
            console.error("Error:", error);
            document.getElementById("errorMessage").textContent = "An error occurred. Please try again.";
        }
    });

}
