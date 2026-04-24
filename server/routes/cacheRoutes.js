const express = require("express");
const { getCacheStats, invalidateCachePattern } = require("../config/redis");
const { getCacheKeyPrefix } = require("../utils/cacheKeys");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Protect all routes
router.use(protect);

/**
 * GET /api/cache/stats
 * Get Redis cache statistics
 */
const getCacheStatsHandler = async (req, res, next) => {
  try {
    const stats = await getCacheStats();
    res.json({ success: true, cache: stats });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/cache/invalidate
 * Invalidate cache by feature type
 * Body: { feature: "chat|notes|quiz|upload" }
 */
const invalidateCacheHandler = async (req, res, next) => {
  try {
    const { feature } = req.body;

    if (!feature) {
      res.status(400);
      throw new Error("feature is required (chat, notes, quiz, or upload)");
    }

    const validFeatures = ["chat", "notes", "quiz", "upload"];
    if (!validFeatures.includes(feature)) {
      res.status(400);
      throw new Error(`Invalid feature. Must be one of: ${validFeatures.join(", ")}`);
    }

    const pattern = getCacheKeyPrefix(feature);
    const deletedCount = await invalidateCachePattern(pattern);

    res.json({
      success: true,
      message: `Cache invalidated for ${feature}`,
      deletedCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/cache/clear-all
 * Clear entire cache (admin only)
 */
const clearAllCacheHandler = async (req, res, next) => {
  try {
    // TODO: Add admin check middleware
    // if (req.user.role !== 'admin') {
    //   return res.status(403).json({ success: false, message: 'Admin access required' });
    // }

    const allDeletedCount = await invalidateCachePattern("*");
    res.json({
      success: true,
      message: "All cache cleared",
      deletedCount: allDeletedCount,
    });
  } catch (error) {
    next(error);
  }
};

router.get("/stats", getCacheStatsHandler);
router.post("/invalidate", invalidateCacheHandler);
router.post("/clear-all", clearAllCacheHandler);

module.exports = router;
