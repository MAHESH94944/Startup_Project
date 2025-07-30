const express = require("express");
const {
  register,
  login,
  logout,
  googleCallback,
  getMe,
} = require("../controllers/authController");
const passport = require("passport");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// Google OAuth login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/" }),
  googleCallback
);

// Get current user info (protected route)
router.get("/me", authMiddleware, getMe);

module.exports = router;
