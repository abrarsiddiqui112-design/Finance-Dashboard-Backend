const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d"
  });
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Name, email, and password are required."
    });
  }

  // ========Registration Email Normalization========
  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "Email is already registered."
    });
  }

  // ========Force Safe Default Role========
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: "viewer"
  });

  const token = generateToken(user._id, user.role);

  return res.status(201).json({
    success: true,
    message: "Account created.",
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    }
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required."
    });
  }

  // ========Login Credential Verification========
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password."
    });
  }

  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      message: "This account is inactive. Contact admin."
    });
  }

  const token = generateToken(user._id, user.role);

  return res.status(200).json({
    success: true,
    message: "Login successful.",
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    }
  });
});

module.exports = {
  registerUser,
  loginUser
};
