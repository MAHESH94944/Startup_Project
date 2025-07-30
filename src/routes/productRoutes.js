const express = require("express");
const { addProduct } = require("../controllers/productController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Admin Product Routes
router.post("/products", authMiddleware, addProduct);
// router.get("/products" /* controller here */);
// router.get("/products/:id" /* controller here */);
// router.put("/products/:id" /* controller here */);
// router.delete("/products/:id" /* controller here */);

module.exports = router;
