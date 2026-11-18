
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");

const router = express.Router();

// Admin authentication
const verifyAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Please login first" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);

        if (!user || user.role !== "admin") {
            return res.status(403).json({ message: "Admin access only" });
        }

        req.admin = user;
        next();

    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

// Get dashboard statistics
router.get("/stats", verifyAdmin, async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalUsers = await User.countDocuments();

        res.json({
            totalProducts,
            totalOrders,
            totalUsers
        });

    } catch (error) {
        res.status(500).json({ message: "Unable to load statistics" });
    }
});

// View all orders
router.get("/orders", verifyAdmin, async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("user", "name email")
            .populate("products.product");

        res.json({ orders });

    } catch (error) {
        res.status(500).json({ message: "Unable to fetch orders" });
    }
});

module.exports = router;
