const express = require("express");
const {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const authMiddleware = require("../middleware/authMiddleware");
const adminCheck = require("../middleware/adminCheck");

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authMiddleware, adminCheck);

// Admin Product Routes
router.post("/products", addProduct);
router.get("/products", getAllProducts);
router.get("/products/:id", getProductById);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

module.exports = router;
