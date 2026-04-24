const express = require("express");
const {
  getUserAnalytics,
  getUserHistory,
  getGlobalAnalytics,
} = require("../controllers/analyticsController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Protect all analytics routes
router.use(protect);

// User's own analytics
router.get("/usage", getUserAnalytics);
router.get("/history", getUserHistory);

// Global analytics (admin only - TODO: add admin middleware)
router.get("/global", getGlobalAnalytics);

module.exports = router;
