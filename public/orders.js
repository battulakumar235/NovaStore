
const ordersList = document.getElementById("ordersList");
const token = sessionStorage.getItem("novaToken");

const orderSteps = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered"
];

function createTrackingTimeline(status) {
    if (status === "Cancelled") {
        return `<p class="cancelled">✖ Order Cancelled</p>`;
    }

    const currentStep = orderSteps.indexOf(status);

    return `
        <div class="tracking-timeline">
            ${orderSteps.map((step, index) => `
                <div class="tracking-step">
                    <div class="step-circle ${index <= currentStep ? "completed" : ""}">
                        ${index <= currentStep ? "✓" : index + 1}
                    </div>
                    <p>${step}</p>
                </div>
            `).join("")}
        </div>
    `;
}

async function loadMyOrders() {
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch("/api/orders/my-orders", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            ordersList.innerHTML = "<p>Unable to load orders.</p>";
            return;
        }

        const orders = data.orders || [];

        if (orders.length === 0) {
            ordersList.innerHTML = `
                <div class="empty-message">
                    <h3>No orders yet!</h3>
                    <p>Your orders will appear here.</p>
                </div>
            `;
            return;
        }

        ordersList.innerHTML = orders.map(order => {
            const items = (order.products || []).map(item => `
                <p>
                    ${item.product?.name || "Product"}
                    - Quantity: ${item.quantity}
                </p>
            `).join("");

            return `
                <div class="order-card">
                    <h3>Order #${order._id.slice(-6)}</h3>

                    <p><strong>Date:</strong>
                        ${new Date(order.createdAt).toLocaleDateString()}
                    </p>

                    <p><strong>Total:</strong> ₹${order.totalAmount}</p>

                    <p><strong>Delivery Address:</strong>
                        ${order.address}
                    </p>

                    <p><strong>Status:</strong>
                        <span class="status">${order.status}</span>
                    </p>

                    <h4>Delivery Progress</h4>
                    ${createTrackingTimeline(order.status)}

                    <div class="order-items">
                        <strong>Ordered Products:</strong>
                        ${items}
                    </div>
                </div>
            `;
        }).join("");

    } catch (error) {
        console.error(error);
        ordersList.innerHTML = "<p>Server connection failed.</p>";
    }
}

loadMyOrders();
