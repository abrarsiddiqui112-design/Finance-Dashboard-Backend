const express = require("express");
const {
  getUsers,
  updateUserRole,
  updateUserStatus
} = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// ========Admin Guard========
router.use(authMiddleware);
router.use(roleMiddleware("admin"));

router.get("/", getUsers);
router.patch("/:id/role", updateUserRole);
router.patch("/:id/status", updateUserStatus);

module.exports = router;
