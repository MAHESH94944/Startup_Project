const Product = require("../models/Product");

// @desc    Add a new product (admin only)
// @route   POST /api/product/products
// @access  Admin
exports.addProduct = async (req, res) => {
  try {
    // Only allow admin users
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    const { name, description, price, stock, category, image } = req.body;
    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    const product = new Product({
      name,
      description,
      price,
      stock,
      category,
      image,
      createdBy: req.user._id,
    });

    await product.save();

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: "Server error" });
  }
};
