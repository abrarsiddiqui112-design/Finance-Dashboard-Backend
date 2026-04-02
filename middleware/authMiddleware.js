const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const authMiddleware = asyncHandler(async (req, res, next) => {
  // ========Token Extraction========
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. Token is required."
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ========Attach Current User========
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. User not found."
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "This account is inactive. Contact admin."
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token."
    });
  }
});

module.exports = authMiddleware;
