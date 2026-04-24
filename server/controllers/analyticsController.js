const {
  getUserUsageStats,
  getUserUsageHistory,
  getGlobalUsageStats,
} = require("../utils/auditLogger");

/**
 * GET /api/analytics/usage
 * Get detailed usage stats for the logged-in user
 * Query params: featureType?, startDate?, endDate?
 */
const getUserAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { featureType, startDate, endDate } = req.query;

    const filters = {};
    if (featureType) filters.featureType = featureType;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const stats = await getUserUsageStats(userId, filters);

    res.json({
      success: true,
      userId,
      period: {
        startDate: startDate || "all time",
        endDate: endDate || "now",
      },
      stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/history
 * Get usage history for the logged-in user
 * Query params: featureType?, limit?, skip?
 */
const getUserHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { featureType, limit = 50, skip = 0 } = req.query;

    const options = {
      limit: Math.min(parseInt(limit), 100), // cap at 100
      skip: parseInt(skip),
    };
    if (featureType) options.featureType = featureType;

    const history = await getUserUsageHistory(userId, options);

    res.json({
      success: true,
      userId,
      count: history.length,
      history,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/global
 * Admin endpoint: Get global usage analytics across all users
 * Query params: startDate?, endDate?
 */
const getGlobalAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    // TODO: Add admin check middleware
    // if (req.user.role !== 'admin') {
    //   return res.status(403).json({ success: false, message: 'Admin access required' });
    // }

    const filters = {};
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const stats = await getGlobalUsageStats(filters);

    res.json({
      success: true,
      period: {
        startDate: startDate || "all time",
        endDate: endDate || "now",
      },
      stats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUserAnalytics, getUserHistory, getGlobalAnalytics };
