
const token = sessionStorage.getItem("novaToken");

const profileForm = document.getElementById("profileForm");
const passwordForm = document.getElementById("passwordForm");

const message = document.getElementById("message");
const passwordMessage = document.getElementById("passwordMessage");

// Check login
if (!token) {
    window.location.href = "login.html";
}

// Load customer profile
async function loadProfile() {
    try {
        const response = await fetch("/api/profile", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.message || "Unable to load profile";
            message.style.color = "red";
            return;
        }

        document.getElementById("name").value = data.user.name || "";
        document.getElementById("email").value = data.user.email || "";
        document.getElementById("phone").value = data.user.phone || "";

    } catch (error) {
        console.error(error);
        message.textContent = "Server connection failed";
        message.style.color = "red";
    }
}

// Update customer profile
profileForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    message.textContent = "Updating profile...";

    try {
        const response = await fetch("/api/profile", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                name: document.getElementById("name").value.trim(),
                phone: document.getElementById("phone").value.trim()
            })
        });

        const data = await response.json();

        message.textContent = data.message;
        message.style.color = response.ok ? "green" : "red";

        if (response.ok) {
            sessionStorage.setItem(
                "novaUser",
                JSON.stringify(data.user)
            );
        }

    } catch (error) {
        console.error(error);
        message.textContent = "Unable to update profile";
        message.style.color = "red";
    }
});

// Change password
passwordForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const currentPassword =
        document.getElementById("currentPassword").value;

    const newPassword =
        document.getElementById("newPassword").value;

    if (newPassword.length < 6) {
        passwordMessage.textContent =
            "New password must contain at least 6 characters";
        passwordMessage.style.color = "red";
        return;
    }

    passwordMessage.textContent = "Changing password...";

    try {
        const response = await fetch("/api/profile/password", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });

        const data = await response.json();

        passwordMessage.textContent = data.message;
        passwordMessage.style.color = response.ok ? "green" : "red";

        if (response.ok) {
            passwordForm.reset();
        }

    } catch (error) {
        console.error(error);
        passwordMessage.textContent = "Unable to change password";
        passwordMessage.style.color = "red";
    }
});

// Logout
function logout() {
    sessionStorage.removeItem("novaToken");
    sessionStorage.removeItem("novaUser");

    window.location.href = "login.html";
}

// Start profile page
loadProfile();
