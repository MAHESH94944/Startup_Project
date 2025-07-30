const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { isStrongPassword } = require("../utils/validator");

// Helper function to create a JWT token for a user
const createToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Controller for user registration (local signup)
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // Basic input sanitization
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
    // Validate password strength
    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters and include uppercase, lowercase, number, and special character",
      });
    }
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role: "user",
    });
    // Generate JWT and set as cookie
    const token = createToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      // Do not return token in body for security
    });
  } catch (err) {
    // Log error internally, but send generic message to client
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Controller for user login (local login)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Basic input type validation
    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ message: "Invalid input types" });
    }
    // Find user by email
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    // Generate JWT and set as cookie
    const token = createToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Controller for Google OAuth callback
// Called after Google redirects back to our server
// Generates JWT and returns token and user info as JSON (for debugging)
exports.googleCallback = (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Google authentication failed" });
    }
    const jwt = require("jsonwebtoken");
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user,
    });
  } catch (err) {
    console.error("Google OAuth error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Controller for logging out the user (clears the JWT cookie)
exports.logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(200).json({ message: "Logged out successfully" });
};

// Controller to get current authenticated user's info
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
