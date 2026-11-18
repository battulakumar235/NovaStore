
const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const sendOrderStatusEmail = require("../utils/sendEmail");
const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");

const router = express.Router();

// Admin authentication
const verifyAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Please login first"
            });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);

        if (!user || user.role !== "admin") {
            return res.status(403).json({
                message: "Admin access only"
            });
        }

        req.admin = user;
        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid token"
        });
    }
};

// Dashboard statistics
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
        console.error(error);
        res.status(500).json({
            message: "Unable to load statistics"
        });
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
        console.error(error);
        res.status(500).json({
            message: "Unable to fetch orders"
        });
    }
});

// Update order status

router.patch("/orders/:id/status", verifyAdmin, async (req, res) => {
    try {
        const { status } = req.body;

        const allowedStatuses = [
            "Pending",
            "Processing",
            "Shipped",
            "Delivered",
            "Cancelled"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid order status"
            });
        }

        const order = await Order.findById(req.params.id)
            .populate("user", "name email");

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        order.status = status;
        await order.save();

        // Send email notification
        try {
            if (order.user && order.user.email) {
                await sendOrderStatusEmail(
                    order.user.email,
                    order._id,
                    status
                );
            }
        } catch (emailError) {
            console.error("Email sending failed:", emailError.message);
        }

        res.json({
            message: "Order status updated successfully",
            order
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Unable to update order status"
        });
    }
});


const requireProductFields = (body) => {
    const { name, description, price, image, category, stock } = body;

    if (
        !name?.trim() ||
        !description?.trim() ||
        !image?.trim() ||
        !category?.trim() ||
        !Number.isFinite(Number(price)) ||
        Number(price) <= 0 ||
        (stock !== undefined &&
            (!Number.isInteger(Number(stock)) || Number(stock) < 0))
    ) {
        return "Please enter valid product details";
    }

    return null;
};

// Add product
router.post("/products", verifyAdmin, async (req, res) => {
    try {
        const error = requireProductFields(req.body);

        if (error) {
            return res.status(400).json({ message: error });
        }

        const product = await Product.create({
            ...req.body,
            price: Number(req.body.price),
            stock: req.body.stock === undefined ? 10 : Number(req.body.stock)
        });

        res.status(201).json({
            message: "Product added successfully!",
            product
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Unable to add product" });
    }
});

// Edit product
router.put("/products/:id", verifyAdmin, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        const error = requireProductFields(req.body);

        if (error) {
            return res.status(400).json({ message: error });
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                ...req.body,
                price: Number(req.body.price),
                stock: Number(req.body.stock)
            },
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json({ message: "Product updated successfully!", product });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Unable to update product" });
    }
});

// Delete product
router.delete("/products/:id", verifyAdmin, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json({ message: "Product deleted successfully!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Unable to delete product" });
    }
});

module.exports = router;
