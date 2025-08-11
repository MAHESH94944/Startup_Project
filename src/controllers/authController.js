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

// Centralized cookie options so persistence is consistent everywhere.
// In production (Render) frontend and backend are on different domains, so we need SameSite=None + Secure.
// We also rely on app.set('trust proxy', 1) so secure cookies are accepted behind the proxy.
const getCookieOptions = () => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd, // must be true for SameSite=None cookies
    sameSite: isProd ? "None" : "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  };
};

const sendTokenResponse = (res, user, message) => {
  const token = createToken(user);
  res.cookie("token", token, getCookieOptions());
  res.json({
    message,
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
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

    sendTokenResponse(res, user, "User registered successfully");
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

    sendTokenResponse(res, user, "Login successful");
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Controller for Google OAuth callback
// Called after Google redirects back to our server
// Sets a persistent cookie and redirects to the frontend
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

// Controller for logging out the user (clears the JWT cookie)
exports.logout = (req, res) => {
  // Use same cookie attributes to ensure proper clearing in browsers
  const opts = getCookieOptions();
  // clearCookie ignores maxAge, so we spread without it
  const { maxAge, ...clearOpts } = opts;
  res.clearCookie("token", clearOpts);
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
