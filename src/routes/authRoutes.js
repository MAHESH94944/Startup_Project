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

// Google OAuth Routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// The callback route now lets the controller handle the success redirect.
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_failed`,
    session: false, // We are using JWT, not sessions
  }),
  googleCallback
);

// Get current user info (protected route)
router.get("/me", authMiddleware, getMe);

module.exports = router;
