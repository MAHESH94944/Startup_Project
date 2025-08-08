const Product = require("../models/Product");
const { uploadToImageKit } = require("../services/storage.service");

// Helper function to parse form-data fields
const parseProductData = (body) => {
  const {
    title,
    price,
    discount,
    description,
    country,
    deliveryAndReturns,
    stock,
  } = body;

  let { size, color, productInformation } = body;

  try {
    if (size) size = JSON.parse(size);
    if (color) color = JSON.parse(color);
    if (productInformation) productInformation = JSON.parse(productInformation);
  } catch (e) {
    throw new Error(
      "Invalid JSON format for size, color, or productInformation."
    );
  }

  return {
    title,
    price,
    discount,
    size,
    description,
    color,
    country,
    deliveryAndReturns,
    productInformation,
    stock,
  };
};

// @desc    Add a new product (admin only)
// @route   POST /api/admin/products
// @access  Admin
exports.addProduct = async (req, res) => {
  try {
    // Secure: Check for admin user
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    const productData = parseProductData(req.body);

    if (!productData.title || !productData.price || !productData.description) {
      return res
        .status(400)
        .json({ message: "Title, price, and description are required" });
    }

    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one image is required" });
    }

    // Upload images to ImageKit
    const imageUploadPromises = req.files.map((file) => uploadToImageKit(file));
    const uploadedImages = await Promise.all(imageUploadPromises);
    const imageUrls = uploadedImages.map((result) => result.url);

    const product = new Product({
      ...productData,
      img: imageUrls,
      createdBy: req.user._id,
    });

    await product.save();

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    if (error.message.includes("Invalid JSON format")) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all products with filters (admin only)
// @route   GET /api/admin/products
// @access  Admin
exports.getAllProducts = async (req, res) => {
  try {
    // Secure: Check for admin user
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    const { page = 1, limit = 10, search, color, size } = req.query;

    // Build filter object
    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (color) filter.color = { $in: [color] };
    if (size) filter.size = { $in: [parseInt(size)] };

    const products = await Product.find(filter)
      .populate("createdBy", "name email")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get single product by ID (admin only)
// @route   GET /api/admin/products/:id
// @access  Admin
exports.getProductById = async (req, res) => {
  try {
    // Secure: Check for admin user
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    const product = await Product.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ product });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update product (admin only)
// @route   PUT /api/admin/products/:id
// @access  Admin
exports.updateProduct = async (req, res) => {
  try {
    // Secure: Check for admin user
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const productData = parseProductData(req.body);

    let imageUrls = product.img;
    if (req.files && req.files.length > 0) {
      // If new images are uploaded, upload them and replace old ones
      const imageUploadPromises = req.files.map((file) =>
        uploadToImageKit(file)
      );
      const uploadedImages = await Promise.all(imageUploadPromises);
      imageUrls = uploadedImages.map((result) => result.url);
      // TODO: Optionally delete old images from ImageKit
    }

    // Update fields
    product.img = imageUrls;
    Object.assign(product, productData);

    await product.save();

    res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    if (error.message.includes("Invalid JSON format")) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete product (admin only)
// @route   DELETE /api/admin/products/:id
// @access  Admin
exports.deleteProduct = async (req, res) => {
  try {
    // Secure: Check for admin user
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// @route   DELETE /api/admin/products/:id
// @access  Admin
exports.deleteProduct = async (req, res) => {
  try {
    // Secure: Check for admin user
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Server error" });
  }
};
