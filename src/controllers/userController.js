const User = require("../models/User");
const { isStrongPassword } = require("../utils/validator");
const bcrypt = require("bcryptjs");

// @desc    Get logged-in user's profile
// @route   GET /api/user/profile
// @access  Private
exports.getProfile = (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No user logged in" });
    }
    const {
      _id,
      name,
      email,
      role,
      phone,
      provider,
      googleId,
      createdAt,
      updatedAt,
    } = req.user;
    res.status(200).json({
      user: {
        id: _id,
        name,
        email,
        role,
        phone,
        provider,
        googleId,
        createdAt,
        updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update logged-in user's profile
// @route   PATCH /api/user/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No user logged in" });
    }
    const { name, email, phone, password, oldPassword } = req.body;

    // Update name
    if (name) user.name = name;

    // Update email (check if new email already exists)
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already exists" });
      }
      user.email = email;
      // TODO: trigger email re-verification
    }

    // Update phone (OTP verification logic can be added here)
    if (phone) user.phone = phone;

    // Update password (require old password, only for local provider)
    if (password) {
      if (user.provider !== "local") {
        return res.status(400).json({
          message: "You cannot change password for social login account",
        });
      }
      if (!oldPassword) {
        return res.status(400).json({ message: "Old password required" });
      }
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Old password incorrect" });
      }
      if (!isStrongPassword(password)) {
        return res.status(400).json({
          message:
            "Password must be at least 6 characters and include uppercase, lowercase, number, and special character",
        });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        provider: user.provider,
        googleId: user.googleId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};
