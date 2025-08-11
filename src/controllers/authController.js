const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { isStrongPassword } = require("../utils/validator");

// Helper: create JWT valid for 7 days
const createToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

// Cookie config helper
const getCookieOptions = () => {
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
  const envSameSite = process.env.COOKIE_SAMESITE;
  const envSecure = process.env.COOKIE_SECURE;
  const isProd = process.env.NODE_ENV === "production";

  // Handle SameSite
  let sameSite = envSameSite || (isProd ? "None" : "Lax");

  // Handle Secure flag
  let secure;
  if (envSecure !== undefined) {
    secure = envSecure.toLowerCase() === "true";
  } else {
    secure = sameSite === "None" ? isProd : false;
  }

  return {
    httpOnly: true,
    sameSite,
    secure,
    maxAge,
    expires: new Date(Date.now() + maxAge), // ensures persistence in Safari/Firefox
    path: "/",
  };
};

// Send token in cookie + JSON response
const sendTokenResponse = (res, user, message) => {
  const token = createToken(user);
  res.cookie("token", token, getCookieOptions());
  res.json({
    message,
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({ message: "Invalid input types" });
    }
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password required" });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters and include uppercase, lowercase, number, and special character",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "user",
    });

    sendTokenResponse(res, user, "User registered successfully");
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ message: "Invalid input types" });
    }

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    sendTokenResponse(res, user, "Login successful");
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Google OAuth callback
exports.googleCallback = (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res
        .status(401)
        .redirect(`${process.env.FRONTEND_URL || ""}/login?error=auth_failed`);
    }
    const token = createToken(user);
    res.cookie("token", token, getCookieOptions());
    res.redirect(process.env.FRONTEND_URL || "/");
  } catch (err) {
    console.error("Google OAuth error:", err);
    res.redirect(`${process.env.FRONTEND_URL || ""}/login?error=server_error`);
  }
};

// Logout
exports.logout = (req, res) => {
  const opts = getCookieOptions();
  const { maxAge, expires, ...clearOpts } = opts; // remove time-based fields
  res.clearCookie("token", clearOpts);
  res.status(200).json({ message: "Logged out successfully" });
};

// Get current user
exports.getMe = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
};
