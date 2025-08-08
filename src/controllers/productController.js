const Product = require("../models/Product");
const { uploadToImageKit } = require("../services/storage.service");

// @desc    Add a new product (admin only)
// @route   POST /api/admin/products
// @access  Admin
exports.addProduct = async (req, res) => {
  try {
    let {
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
    } = req.body;

    if (!title || !price || !description) {
      return res
        .status(400)
        .json({ message: "Title, price, and description are required" });
    }

    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one image is required" });
    }

    // Parse stringified fields from multipart/form-data
    try {
      if (size) size = JSON.parse(size);
      if (color) color = JSON.parse(color);
      if (productInformation)
        productInformation = JSON.parse(productInformation);
    } catch (parseError) {
      return res
        .status(400)
        .json({
          message:
            "Invalid format for size, color, or productInformation. They must be valid JSON strings.",
        });
    }

    // Upload images to ImageKit
    const imageUploadPromises = req.files.map((file) => uploadToImageKit(file));
    const uploadedImages = await Promise.all(imageUploadPromises);
    const imageUrls = uploadedImages.map((result) => result.url);

    const product = new Product({
      img: imageUrls,
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

// @desc    Get all products with filters (admin only)
// @route   GET /api/admin/products
// @access  Admin
exports.getAllProducts = async (req, res) => {
  try {
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
    let {
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
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Parse stringified fields from multipart/form-data if they exist
    try {
      if (size) size = JSON.parse(size);
      if (color) color = JSON.parse(color);
      if (productInformation)
        productInformation = JSON.parse(productInformation);
    } catch (parseError) {
      return res
        .status(400)
        .json({
          message:
            "Invalid format for size, color, or productInformation. They must be valid JSON strings.",
        });
    }

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
    product.title = title || product.title;
    product.price = price !== undefined ? price : product.price;
    product.discount = discount !== undefined ? discount : product.discount;
    product.size = size || product.size;
    product.description = description || product.description;
    product.color = color || product.color;
    product.country = country || product.country;
    product.deliveryAndReturns =
      deliveryAndReturns || product.deliveryAndReturns;
    product.productInformation =
      productInformation || product.productInformation;
    product.stock = stock !== undefined ? stock : product.stock;

    await product.save();

    res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete product (admin only)
// @route   DELETE /api/admin/products/:id
// @access  Admin
exports.deleteProduct = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
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
