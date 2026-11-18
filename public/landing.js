
/* =================================
   NOVASTORE - MAIN JAVASCRIPT
================================= */

// ELEMENTS

const visualArea = document.getElementById("visualArea");
const productObject = document.getElementById("productObject");
const mainProduct = document.getElementById("mainProduct");

const previousButton = document.getElementById("previousProduct");
const nextButton = document.getElementById("nextProduct");
const productNumber = document.getElementById("productNumber");

const themeToggle = document.getElementById("themeToggle");

// PRODUCT DATA

const productImages = [
    {
        name: "Classic Backpack",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900"
    },
    {
        name: "Premium Watch",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900"
    },
    {
        name: "Wireless Headphones",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900"
    }
];

let currentProduct = 0;
let autoSlide;


// =================================
// DARK / LIGHT MODE
// =================================

if (themeToggle) {

    const savedTheme = localStorage.getItem("novaTheme");

    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
    }

    function updateThemeButton() {

        themeToggle.textContent =
            document.body.classList.contains("dark-mode")
                ? "☀️ Light Mode"
                : "🌙 Dark Mode";

    }

    updateThemeButton();

    themeToggle.addEventListener("click", () => {

        document.body.classList.toggle("dark-mode");

        const isDark =
            document.body.classList.contains("dark-mode");

        localStorage.setItem(
            "novaTheme",
            isDark ? "dark" : "light"
        );

        updateThemeButton();

    });
}


// =================================
// PRODUCT SLIDER
// =================================

function showProduct(index) {

    if (!mainProduct || !productNumber) return;

    currentProduct =
        (index + productImages.length) % productImages.length;

    mainProduct.style.opacity = "0";

    setTimeout(() => {

        const product = productImages[currentProduct];

        mainProduct.src = product.image;
        mainProduct.alt = product.name;

        productNumber.textContent =
            `0${currentProduct + 1} / 0${productImages.length}`;

        mainProduct.style.opacity = "1";

    }, 250);

}


// NEXT PRODUCT

if (nextButton) {

    nextButton.addEventListener("click", () => {

        showProduct(currentProduct + 1);
        restartAutoSlide();

    });

}


// PREVIOUS PRODUCT

if (previousButton) {

    previousButton.addEventListener("click", () => {

        showProduct(currentProduct - 1);
        restartAutoSlide();

    });

}


// AUTOMATIC SLIDER

function startAutoSlide() {

    clearInterval(autoSlide);

    autoSlide = setInterval(() => {

        showProduct(currentProduct + 1);

    }, 5000);

}


function restartAutoSlide() {

    startAutoSlide();

}

if (mainProduct && productNumber) {
    startAutoSlide();
}


// =================================
// 3D MOUSE INTERACTION
// =================================

if (visualArea && productObject) {

    visualArea.addEventListener("mousemove", (event) => {

        const rect = visualArea.getBoundingClientRect();

        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateY =
            ((mouseX - centerX) / centerX) * 12;

        const rotateX =
            ((centerY - mouseY) / centerY) * 12;

        productObject.style.animation = "none";

        productObject.style.transform =
            `translateY(-10px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

    });


    // RESET 3D EFFECT

    visualArea.addEventListener("mouseleave", () => {

        productObject.style.transform = "";

        productObject.style.animation =
            "productFloat 5s ease-in-out infinite";

    });


    // TOUCH INTERACTION

    visualArea.addEventListener("touchmove", (event) => {

        const touch = event.touches[0];

        const rect = visualArea.getBoundingClientRect();

        const x = touch.clientX - rect.left;
        const centerX = rect.width / 2;

        const rotateY = (x - centerX) / 25;

        productObject.style.animation = "none";

        productObject.style.transform =
            `translateY(-10px) rotateY(${rotateY}deg)`;

    }, { passive: true });

}


// =================================
// SCROLL REVEAL
// =================================

const revealElements = document.querySelectorAll(
    ".collection, footer, .collection-card"
);

if ("IntersectionObserver" in window) {

    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add("visible");

                observer.unobserve(entry.target);

            }

        });

    }, {
        threshold: 0.12
    });


    revealElements.forEach((element, index) => {

        element.classList.add("reveal");

        if (element.classList.contains("collection-card")) {

            element.style.transitionDelay =
                `${index * 0.15}s`;

        }

        observer.observe(element);

    });

} else {

    revealElements.forEach(element => {
        element.classList.add("visible");
    });

}


// =================================
// NOVASTORE READY
// =================================

console.log("NovaStore JavaScript loaded successfully!");
