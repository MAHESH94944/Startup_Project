const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    phone: { type: String },
    role: { type: String, default: "user" },
    provider: { type: String, default: "local" },
    googleId: { type: String },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  // Debug: log password before hashing
  // console.log("Before hashing:", this.password);
  if (!this.isModified("password")) return next();
  if (this.password) {
    // Prevent double hashing if already hashed (bcrypt hashes start with $2)
    if (!this.password.startsWith("$2")) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      // Debug: log password after hashing
      // console.log("After hashing:", this.password);
    }
  }
  next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
