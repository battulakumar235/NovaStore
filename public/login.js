
const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    message.textContent = "Logging in...";

    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.message || "Login failed.";
            message.style.color = "red";
            return;
        }

        // Save login information
        sessionStorage.setItem("novaToken", data.token);
        sessionStorage.setItem("novaUser", JSON.stringify(data.user));

        message.textContent = "Login successful!";
        message.style.color = "green";

        setTimeout(() => {
            if (data.user.role === "admin") {
                window.location.href = "admin.html";
            } else {
                window.location.href = "dashboard.html";
            }
        }, 1000);

    } catch (error) {
        message.textContent = "Unable to connect to server.";
        message.style.color = "red";
    }
});
