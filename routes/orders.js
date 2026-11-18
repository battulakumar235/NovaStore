
const express = require("express");
const jwt = require("jsonwebtoken");
const Order = require("../models/Order");
const Product = require("../models/Product");

const router = express.Router();

// Verify logged-in user
const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Please login first"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.userId = decoded.id;
        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

// PLACE ORDER
router.post("/", verifyToken, async (req, res) => {
    try {
        const { products, address } = req.body;

        if (!Array.isArray(products) || products.length === 0 || !address) {
            return res.status(400).json({
                message: "Products and delivery address are required"
            });
        }

        let totalAmount = 0;
        const orderProducts = [];

        for (const item of products) {
            const quantity = Number(item.quantity);

            if (!Number.isInteger(quantity) || quantity < 1) {
                return res.status(400).json({
                    message: "Invalid product quantity"
                });
            }

            const product = await Product.findById(item.product);

            if (!product) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }

            const price = Number(product.price);

            if (!Number.isFinite(price) || price < 0) {
                return res.status(400).json({
                    message: "Invalid product price"
                });
            }

            totalAmount += price * quantity;

            orderProducts.push({
                product: product._id,
                quantity
            });
        }

        const order = await Order.create({
            user: req.userId,
            products: orderProducts,
            totalAmount,
            address
        });

        res.status(201).json({
            message: "Order placed successfully!",
            order
        });

    } catch (error) {
        console.error("Order error:", error);

        res.status(500).json({
            message: "Unable to place order"
        });
    }
});

// GET LOGGED-IN USER'S ORDERS
router.get("/my-orders", verifyToken, async (req, res) => {
    try {
        const orders = await Order.find({
            user: req.userId
        }).populate("products.product");

        res.json({
            orders
        });

    } catch (error) {
        console.error("Fetch orders error:", error);

        res.status(500).json({
            message: "Unable to fetch orders"
        });
    }
});

module.exports = router;
