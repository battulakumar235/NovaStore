
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Verify customer login
const verifyUser = async (req, res, next) => {
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

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        req.user = user;
        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid token"
        });
    }
};

// Get customer profile
router.get("/", verifyUser, async (req, res) => {
    res.json({
        user: {
            name: req.user.name,
            email: req.user.email,
            phone: req.user.phone || ""
        }
    });
});

// Update customer profile
router.put("/", verifyUser, async (req, res) => {
    try {
        const { name, phone } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Name is required"
            });
        }

        req.user.name = name.trim();
        req.user.phone = phone || "";

        await req.user.save();

        res.json({
            message: "Profile updated successfully",
            user: {
                name: req.user.name,
                email: req.user.email,
                phone: req.user.phone
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Unable to update profile"
        });
    }
});

// Change password
router.patch("/password", verifyUser, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword || newPassword.length < 6) {
            return res.status(400).json({
                message: "Enter your current password and a new password of at least 6 characters"
            });
        }

        const isMatch = await req.user.comparePassword(currentPassword);

        if (!isMatch) {
            return res.status(400).json({
                message: "Current password is incorrect"
            });
        }

        req.user.password = newPassword;
        await req.user.save();

        res.json({
            message: "Password changed successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Unable to change password"
        });
    }
});

module.exports = router;
