const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    img: [{ type: String, required: true }], // At least one image
    title: { type: String, required: true, trim: true, minlength: 3 },
    price: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 }, // %
    size: [{ type: Number, enum: [6, 7, 8, 9, 10] }],
    description: { type: String, required: true, trim: true },
    color: [{ type: String, trim: true }],
    country: { type: String, trim: true },
    deliveryAndReturns: { type: String, trim: true },
    productInformation: {
      material: { type: String, trim: true },
      care: { type: String, trim: true },
    },
    stock: { type: Number, default: 0, min: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
