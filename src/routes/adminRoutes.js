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
const upload = require("../middleware/multer.middleware");

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authMiddleware, adminCheck);

// Admin Product Routes
router.post("/products", upload.array("img", 5), addProduct); // 'img' is the key for files
router.get("/products", getAllProducts);
router.get("/products/:id", getProductById);
router.put("/products/:id", upload.array("img", 5), updateProduct); // Handle up to 5 images
router.delete("/products/:id", deleteProduct);

module.exports = router;
