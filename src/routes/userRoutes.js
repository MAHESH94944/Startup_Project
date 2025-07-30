const express = require("express");
const { getProfile, updateProfile } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get logged-in user's profile (protected)
router.get("/profile", authMiddleware, getProfile);

// Update logged-in user's profile (protected)
router.patch("/profile", authMiddleware, updateProfile);

module.exports = router;
