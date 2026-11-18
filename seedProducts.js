
require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const products = [
    {
        name: "Classic Backpack",
        description: "Stylish and comfortable backpack for everyday use.",
        price: 899,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
        category: "Accessories",
        stock: 10
    },
    {
        name: "Everyday Watch",
        description: "Elegant watch suitable for every occasion.",
        price: 1299,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
        category: "Fashion",
        stock: 10
    },
    {
        name: "Wireless Headphones",
        description: "Enjoy clear sound with wireless headphones.",
        price: 1599,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
        category: "Electronics",
        stock: 10
    },
    {
        name: "Casual Shoes",
        description: "Comfortable shoes for daily activities.",
        price: 1199,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
        category: "Footwear",
        stock: 10
    }
];

async function seedProducts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        await Product.insertMany(products);

        console.log("Four products added successfully!");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

seedProducts();
