
const token = sessionStorage.getItem("novaToken");

async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token,
            ...options.headers
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Request failed");
    }

    return data;
}

// Dashboard statistics
async function loadDashboard() {
    const message = document.getElementById("message");

    try {
        if (!token) throw new Error("Please login first");

        const data = await apiRequest("/api/admin/stats");

        document.getElementById("products").textContent = data.totalProducts;
        document.getElementById("orders").textContent = data.totalOrders;
        document.getElementById("users").textContent = data.totalUsers;

        message.textContent = "Dashboard loaded successfully!";

    } catch (error) {
        message.textContent = error.message;
    }
}

// Load customer orders
async function loadOrders() {
    const table = document.getElementById("ordersTable");

    try {
        const data = await apiRequest("/api/admin/orders");
        table.innerHTML = "";

        if (!data.orders.length) {
            table.innerHTML = '<tr><td colspan="6">No orders found.</td></tr>';
            return;
        }

        data.orders.forEach(order => {
            const row = document.createElement("tr");

            const customer = document.createElement("td");
            customer.textContent = order.user?.name || "Unknown";

            const products = document.createElement("td");
            products.textContent = order.products.map(item =>
                `${item.product?.name || "Product"} × ${item.quantity}`
            ).join(", ");

            const total = document.createElement("td");
            total.textContent = "₹" + order.totalAmount;

            const address = document.createElement("td");
            address.textContent = order.address;

            const statusCell = document.createElement("td");
            const select = document.createElement("select");

            ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"]
                .forEach(status => {
                    const option = document.createElement("option");
                    option.value = status;
                    option.textContent = status;
                    option.selected = order.status === status;
                    select.appendChild(option);
                });

            statusCell.appendChild(select);

            const updateCell = document.createElement("td");
            const button = document.createElement("button");
            button.textContent = "Update";
            button.className = "action-btn";

            button.onclick = async () => {
                try {
                    button.disabled = true;

                    const result = await apiRequest(
                        `/api/admin/orders/${order._id}/status`,
                        {
                            method: "PATCH",
                            body: JSON.stringify({ status: select.value })
                        }
                    );

                    alert(result.message);
                } catch (error) {
                    alert(error.message);
                } finally {
                    button.disabled = false;
                }
            };

            updateCell.appendChild(button);
            row.append(customer, products, total, address, statusCell, updateCell);
            table.appendChild(row);
        });

    } catch (error) {
        table.innerHTML = `<tr><td colspan="6">${error.message}</td></tr>`;
    }
}

// Load products
async function loadAdminProducts() {
    const table = document.getElementById("productsTable");

    try {
        const response = await fetch("/api/products");
        const data = await response.json();

        table.innerHTML = "";

        data.products.forEach(product => {
            const row = document.createElement("tr");

            const imageCell = document.createElement("td");
            const image = document.createElement("img");
            image.src = product.image;
            image.alt = product.name;
            imageCell.appendChild(image);

            const name = document.createElement("td");
            name.textContent = product.name;

            const price = document.createElement("td");
            price.textContent = "₹" + product.price;

            const category = document.createElement("td");
            category.textContent = product.category;

            const stock = document.createElement("td");
            stock.textContent = product.stock;

            const actions = document.createElement("td");

            const edit = document.createElement("button");
            edit.textContent = "Edit";
            edit.className = "action-btn";
            edit.onclick = () => editProduct(product);

            const remove = document.createElement("button");
            remove.textContent = "Delete";
            remove.className = "action-btn delete-btn";
            remove.onclick = () => deleteProduct(product._id);

            actions.append(edit, remove);
            row.append(imageCell, name, price, category, stock, actions);
            table.appendChild(row);
        });

        if (!data.products.length) {
            table.innerHTML = '<tr><td colspan="6">No products found.</td></tr>';
        }

    } catch (error) {
        table.innerHTML = `<tr><td colspan="6">${error.message}</td></tr>`;
    }
}

// Add or edit product
const productForm = document.getElementById("productForm");

productForm.addEventListener("submit", async event => {
    event.preventDefault();

    const id = document.getElementById("productId").value;

    const product = {
        name: document.getElementById("productName").value.trim(),
        description: document.getElementById("productDescription").value.trim(),
        price: Number(document.getElementById("productPrice").value),
        image: document.getElementById("productImage").value.trim(),
        category: document.getElementById("productCategory").value.trim(),
        stock: Number(document.getElementById("productStock").value)
    };

    try {
        const data = await apiRequest(
            id ? `/api/admin/products/${id}` : "/api/admin/products",
            {
                method: id ? "PUT" : "POST",
                body: JSON.stringify(product)
            }
        );

        document.getElementById("productMessage").textContent = data.message;

        resetProductForm();
        await loadAdminProducts();
        await loadDashboard();

    } catch (error) {
        document.getElementById("productMessage").textContent = error.message;
    }
});

// Edit product
function editProduct(product) {
    document.getElementById("productId").value = product._id;
    document.getElementById("productName").value = product.name;
    document.getElementById("productDescription").value = product.description;
    document.getElementById("productPrice").value = product.price;
    document.getElementById("productImage").value = product.image;
    document.getElementById("productCategory").value = product.category;
    document.getElementById("productStock").value = product.stock;

    document.getElementById("productFormTitle").textContent = "Edit Product";
    document.getElementById("saveProductButton").textContent = "Save Changes";
    document.getElementById("cancelEditButton").hidden = false;
}

// Reset form
function resetProductForm() {
    productForm.reset();
    document.getElementById("productId").value = "";
    document.getElementById("productStock").value = 10;
    document.getElementById("productFormTitle").textContent = "Add New Product";
    document.getElementById("saveProductButton").textContent = "Add Product";
    document.getElementById("cancelEditButton").hidden = true;
}

// Delete product
async function deleteProduct(id) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
        const data = await apiRequest(`/api/admin/products/${id}`, {
            method: "DELETE"
        });

        alert(data.message);
        await loadAdminProducts();
        await loadDashboard();

    } catch (error) {
        alert(error.message);
    }
}

// Initialize dashboard
if (!token) {
    window.location.href = "/login.html";
} else {
    loadDashboard();
    loadOrders();
    loadAdminProducts();
}
