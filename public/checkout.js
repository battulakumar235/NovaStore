
const checkoutItems = document.getElementById("checkoutItems");
const subtotalElement = document.getElementById("subtotal");
const deliveryElement = document.getElementById("delivery");
const grandTotalElement = document.getElementById("grandTotal");
const checkoutForm = document.getElementById("checkoutForm");
const checkoutMessage = document.getElementById("checkoutMessage");

let cart = JSON.parse(sessionStorage.getItem("novaCart") || "[]");

function displayOrderSummary() {
    checkoutItems.innerHTML = "";

    let subtotal = 0;

    cart.forEach(item => {
        const quantity = Number(item.quantity) || 1;
        const price = Number(item.price) || 0;
        const amount = price * quantity;

        subtotal += amount;

        const row = document.createElement("div");
        row.className = "checkout-item";

        const name = document.createElement("span");
        name.textContent = `${item.name} × ${quantity}`;

        const total = document.createElement("strong");
        total.textContent = `₹${amount}`;

        row.append(name, total);
        checkoutItems.appendChild(row);
    });

    const delivery = subtotal >= 1000 ? 0 : 50;

    subtotalElement.textContent = `₹${subtotal}`;
    deliveryElement.textContent =
        delivery === 0 ? "FREE" : `₹${delivery}`;

    grandTotalElement.textContent = `₹${subtotal + delivery}`;
}

const savedUser = JSON.parse(
    sessionStorage.getItem("novaUser") || "null"
);

if (savedUser) {
    document.getElementById("customerName").value =
        savedUser.name || "";

    document.getElementById("customerEmail").value =
        savedUser.email || "";
}

checkoutForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const token = sessionStorage.getItem("novaToken");

    if (!token) {
        checkoutMessage.textContent =
            "Please login before placing your order.";

        return;
    }

    if (cart.length === 0) {
        checkoutMessage.textContent = "Your cart is empty!";
        return;
    }

    if (!checkoutForm.checkValidity()) {
        checkoutForm.reportValidity();
        return;
    }

    const address = [
        document.getElementById("customerAddress").value.trim(),
        document.getElementById("city").value.trim(),
        document.getElementById("pincode").value.trim()
    ].join(", ");

    const orderData = {
        address: address,

        products: cart.map(item => ({
            product: item.id,
            quantity: Number(item.quantity) || 1
        }))
    };

    try {
        const response = await fetch("/api/orders", {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },

            body: JSON.stringify(orderData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Order failed");
        }

        checkoutMessage.textContent =
            "Your order was placed successfully!";

        sessionStorage.removeItem("novaCart");

        cart = [];
        displayOrderSummary();

        checkoutForm.reset();

    } catch (error) {
        console.error("Checkout error:", error);

        checkoutMessage.textContent = error.message;
    }
});

displayOrderSummary();
