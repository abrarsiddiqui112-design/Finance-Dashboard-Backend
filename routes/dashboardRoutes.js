const express = require("express");
const {
  getSummary,
  getCategoryTotals,
  getTrends
} = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// ========Analytics Access Policy========
router.use(authMiddleware);
router.use(roleMiddleware("admin", "analyst"));

router.get("/summary", getSummary);
router.get("/category", getCategoryTotals);
router.get("/trends", getTrends);

module.exports = router;
