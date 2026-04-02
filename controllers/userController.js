const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    message: "Users fetched.",
    count: users.length,
    data: users
  });
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  // ========Role Input Validation========
  const allowedRoles = ["admin", "analyst", "viewer"];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Invalid role. Allowed roles: admin, analyst, viewer."
    });
  }

  const user = await User.findByIdAndUpdate(
    id,
    { role },
    { new: true, runValidators: true }
  ).select("-password");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found."
    });
  }

  return res.status(200).json({
    success: true,
    message: "Role updated.",
    data: user
  });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  // ========Status Input Validation========
  if (typeof isActive !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "isActive must be true or false."
    });
  }

  const user = await User.findByIdAndUpdate(
    id,
    { isActive },
    { new: true, runValidators: true }
  ).select("-password");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found."
    });
  }

  return res.status(200).json({
    success: true,
    message: "Status updated.",
    data: user
  });
});

module.exports = {
  getUsers,
  updateUserRole,
  updateUserStatus
};
