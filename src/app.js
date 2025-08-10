const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const passport = require("passport");
const cookieParser = require("cookie-parser");
require("./config/passport");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// Middleware
app.use(express.json());

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_FRONTEND_URL,
  "http://localhost:5173", // Your local dev URL
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(cookieParser());
app.use(passport.initialize());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Test route
app.get("/", (req, res) => {
  res.send("E-commerce API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/product", productRoutes);
app.use("/api/admin", adminRoutes);

module.exports = app;
