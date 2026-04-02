const express = require("express");
const {
  createRecord,
  getRecords,
  updateRecord,
  deleteRecord
} = require("../controllers/recordController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// ========Authenticated Record Access========
router.use(authMiddleware);

router.get("/", roleMiddleware("admin", "analyst", "viewer"), getRecords);
router.post("/", roleMiddleware("admin"), createRecord);
router.put("/:id", roleMiddleware("admin"), updateRecord);
router.delete("/:id", roleMiddleware("admin"), deleteRecord);

module.exports = router;
