
// ==========================================
// NOVASTORE - COMPLETE FRONTEND JAVASCRIPT
// ==========================================

// PRODUCTS FROM MONGODB
let products = [];

let cart = JSON.parse(sessionStorage.getItem("novaCart") || "[]");
let selectedProduct = null;

// DOM ELEMENTS
const productList = document.getElementById("productList");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");

const cartOverlay = document.getElementById("cartOverlay");
const cartPanel = document.getElementById("cartPanel");
const productModal = document.getElementById("productModal");


// ==========================================
// LOAD PRODUCTS FROM MONGODB
// ==========================================

async function loadProducts() {
    try {
        const response = await fetch("/api/products");
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load products");
        }

        products = (data.products || []).map(product => ({
            ...product,
            id: product._id
        }));

        displayProducts();

    } catch (error) {
        console.error("Product loading error:", error);

        if (productList) {
            productList.innerHTML =
                "<p>Unable to load products. Please try again later.</p>";
        }
    }
}


// ==========================================
// DISPLAY PRODUCTS
// ==========================================

function displayProducts(list = products) {

    if (!productList) return;

    productList.innerHTML = "";

    if (list.length === 0) {
        productList.innerHTML = "<p>No products available.</p>";
        return;
    }

    list.forEach(product => {

        const card = document.createElement("article");
        card.className = "product-card";

        const imageBox = document.createElement("div");
        imageBox.className = "product-image";

        const image = document.createElement("img");
        image.src = product.image;
        image.alt = product.name;
        image.loading = "lazy";

        imageBox.appendChild(image);

        const info = document.createElement("div");
        info.className = "product-info";

        const name = document.createElement("h3");
        name.textContent = product.name;

        const price = document.createElement("p");
        price.className = "product-price";
        price.textContent = `₹${product.price}`;

        const detailsButton = document.createElement("button");
        detailsButton.className = "view-details";
        detailsButton.textContent = "View Details";

        const addButton = document.createElement("button");
        addButton.className = "add-cart";
        addButton.textContent = "Add to Cart +";

        detailsButton.addEventListener("click", () => {
            openProductDetails(product.id);
        });

        image.addEventListener("click", () => {
            openProductDetails(product.id);
        });

        addButton.addEventListener("click", () => {
            addToCart(product.id);
        });

        info.append(name, price, detailsButton, addButton);
        card.append(imageBox, info);

        productList.appendChild(card);
    });
}


// ==========================================
// PRODUCT DETAILS POPUP
// ==========================================

function openProductDetails(id) {

    const product = products.find(item => item.id === id);

    if (!product || !productModal) return;

    selectedProduct = product;

    document.getElementById("modalProductImage").src = product.image;

    document.getElementById("modalProductName").textContent =
        product.name;

    document.getElementById("modalProductPrice").textContent =
        `₹${product.price}`;

    document.getElementById("modalProductDescription").textContent =
        product.description || "Discover quality products at NovaStore.";

    productModal.classList.add("active");
}


function closeProductDetails() {

    if (productModal) {
        productModal.classList.remove("active");
    }

    selectedProduct = null;
}


const modalClose = document.getElementById("modalClose");

if (modalClose) {
    modalClose.addEventListener("click", closeProductDetails);
}


if (productModal) {

    productModal.addEventListener("click", event => {

        if (event.target === productModal) {
            closeProductDetails();
        }

    });
}


const modalAddToCart = document.getElementById("modalAddToCart");

if (modalAddToCart) {

    modalAddToCart.addEventListener("click", () => {

        if (!selectedProduct) return;

        addToCart(selectedProduct.id);

        closeProductDetails();
        openCart();

    });

}


// ==========================================
// SAVE CART
// ==========================================

function saveCart() {

    sessionStorage.setItem(
        "novaCart",
        JSON.stringify(cart)
    );

}


// ==========================================
// ADD TO CART
// ==========================================

function addToCart(id) {

    const product = products.find(item => item.id === id);

    if (!product) return;

    const existing = cart.find(item => item.id === id);

    if (existing) {

        existing.quantity++;

    } else {

        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            description: product.description,
            quantity: 1
        });

    }

    saveCart();
    updateCart();

}


// ==========================================
// UPDATE CART
// ==========================================


// ==========================================
// PREMIUM CART WITH QUANTITY CONTROLS
// ==========================================

function updateCart() {
    if (!cartItems || !cartTotal || !cartCount) return;

    cartItems.innerHTML = "";

    let total = 0;
    let count = 0;

    cart.forEach(item => {
        total += Number(item.price) * item.quantity;
        count += item.quantity;

        const row = document.createElement("div");
        row.className = "cartItem";

        const name = document.createElement("h4");
        name.textContent = item.name;

        const details = document.createElement("p");
        details.textContent = `₹${item.price} each`;

        const controls = document.createElement("div");
        controls.className = "cart-quantity-controls";

        const minus = document.createElement("button");
        minus.textContent = "−";
        minus.className = "quantity-btn";

        const quantity = document.createElement("span");
        quantity.textContent = item.quantity;
        quantity.className = "cart-quantity";

        const plus = document.createElement("button");
        plus.textContent = "+";
        plus.className = "quantity-btn";

        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.className = "remove-item";

        minus.addEventListener("click", () => {
            changeQuantity(item.id, -1);
        });

        plus.addEventListener("click", () => {
            changeQuantity(item.id, 1);
        });

        removeButton.addEventListener("click", () => {
            removeFromCart(item.id);
        });

        controls.append(minus, quantity, plus);

        const subtotal = document.createElement("strong");
        subtotal.className = "cart-subtotal";
        subtotal.textContent =
            `Subtotal: ₹${Number(item.price) * item.quantity}`;

        row.append(name, details, controls, subtotal, removeButton);
        cartItems.appendChild(row);
    });

    cartTotal.textContent = `₹${total}`;
    cartCount.textContent = count;
}

// CHANGE PRODUCT QUANTITY

function changeQuantity(id, change) {
    const item = cart.find(product => product.id === id);

    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        cart = cart.filter(product => product.id !== id);
    }

    saveCart();
    updateCart();
}



// ==========================================
// REMOVE FROM CART
// ==========================================

function removeFromCart(id) {

    cart = cart.filter(item => item.id !== id);

    saveCart();
    updateCart();

}


// ==========================================
// OPEN CART
// ==========================================

function openCart() {

    if (cartOverlay) {
        cartOverlay.classList.add("active");
    }

    if (cartPanel) {
        cartPanel.classList.add("active");
        cartPanel.classList.add("open");
    }

}


// ==========================================
// CLOSE CART
// ==========================================

function closeCart() {

    if (cartOverlay) {
        cartOverlay.classList.remove("active");
    }

    if (cartPanel) {
        cartPanel.classList.remove("active");
        cartPanel.classList.remove("open");
    }

}


const cartButton = document.getElementById("cartButton");
const closeCartButton = document.getElementById("closeCart");

if (cartButton) {
    cartButton.addEventListener("click", openCart);
}

if (closeCartButton) {
    closeCartButton.addEventListener("click", closeCart);
}

if (cartOverlay) {
    cartOverlay.addEventListener("click", closeCart);
}


// ==========================================
// CHECKOUT
// ==========================================

const checkoutButton = document.getElementById("checkoutButton");

if (checkoutButton) {

    checkoutButton.addEventListener("click", () => {

        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        saveCart();

        window.location.href = "checkout.html";

    });

}


// ==========================================
// SEARCH PRODUCTS
// ==========================================

const searchInput = document.getElementById("searchInput");

if (searchInput) {

    searchInput.addEventListener("input", event => {

        const term = event.target.value.trim().toLowerCase();

        const filtered = products.filter(product =>
            product.name.toLowerCase().includes(term)
        );

        displayProducts(filtered);

    });

}


// ==========================================
// DARK AND LIGHT THEME
// ==========================================

const themeToggle = document.getElementById("themeToggle");


function applyTheme(theme) {

    const isDark = theme === "dark";

    document.body.classList.toggle("dark-theme", isDark);

    if (themeToggle) {

        themeToggle.textContent = isDark ? "☀️" : "🌙";

        themeToggle.setAttribute(
            "aria-label",
            isDark ? "Switch to light theme" : "Switch to dark theme"
        );

    }

}


const savedTheme = localStorage.getItem("novaTheme") || "light";

applyTheme(savedTheme);


if (themeToggle) {

    themeToggle.addEventListener("click", () => {

        const nextTheme =
            document.body.classList.contains("dark-theme")
                ? "light"
                : "dark";

        localStorage.setItem("novaTheme", nextTheme);

        applyTheme(nextTheme);

    });

}


// ==========================================
// ESCAPE KEY
// ==========================================

document.addEventListener("keydown", event => {

    if (event.key === "Escape") {

        closeProductDetails();
        closeCart();

    }

});

/* 3D MOUSE FOLLOW EFFECT */

const heroVisual = document.querySelector(".hero-visual");
const floatingImage = document.querySelector(".floating-product img");

if (heroVisual && floatingImage) {
    heroVisual.addEventListener("mousemove", (event) => {
        const rect = heroVisual.getBoundingClientRect();

        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;

        const rotateY = (x - 0.5) * 24;
        const rotateX = (0.5 - y) * 24;

        floatingImage.style.transform =
            `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.04)`;
    });

    heroVisual.addEventListener("mouseleave", () => {
        floatingImage.style.transform =
            "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
    });
}


// ==========================================
// INITIALIZE NOVASTORE
// ==========================================

// PREMIUM CART NOTIFICATION

function showCartMessage(message) {
    let toast = document.getElementById("novaToast");

    if (!toast) {
        toast = document.createElement("div");
        toast.id = "novaToast";
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(window.novaToastTimeout);

    window.novaToastTimeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}

updateCart();
showCartMessage("✓ Added to your cart!");
loadProducts();
