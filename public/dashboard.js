
const token = sessionStorage.getItem("novaToken");
const userData = sessionStorage.getItem("novaUser");

// Check whether the customer is logged in
if (!token || !userData) {
    window.location.href = "login.html";
} else {
    const user = JSON.parse(userData);

    document.getElementById("welcomeMessage").textContent =
        `Hello, ${user.name}! Welcome back.`;

    document.getElementById("userName").textContent = user.name;
    document.getElementById("userEmail").textContent = user.email;
    document.getElementById("userRole").textContent = user.role;
}

// Logout functionality
document.getElementById("logoutBtn").addEventListener("click", function () {
    sessionStorage.removeItem("novaToken");
    sessionStorage.removeItem("novaUser");

    window.location.href = "login.html";
});
