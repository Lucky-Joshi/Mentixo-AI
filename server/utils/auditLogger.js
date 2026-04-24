const AuditLog = require("../models/AuditLog");

/**
 * Log feature usage to audit trail
 * @param {string} userId - User ID
 * @param {string} featureType - "chat", "notes", "quiz", or "upload"
 * @param {string} action - Specific action (e.g., "message_sent")
 * @param {object} options - Optional { resourceId, metadata }
 */
const logFeatureUsage = async (userId, featureType, action, options = {}) => {
  try {
    const auditLog = new AuditLog({
      userId,
      featureType,
      action,
      resourceId: options.resourceId,
      metadata: options.metadata || {},
      timestamp: new Date(),
    });
    await auditLog.save();
  } catch (error) {
    // Silently fail to not break the main operation
    console.error(`[AuditLog Error] Failed to log ${featureType}/${action}:`, error.message);
  }
};

/**
 * Get feature usage stats for a user
 * @param {string} userId - User ID
 * @param {object} filters - Optional { featureType, startDate, endDate }
 */
const getUserUsageStats = async (userId, filters = {}) => {
  try {
    const query = { userId };

    if (filters.featureType) {
      query.featureType = filters.featureType;
    }

    if (filters.startDate || filters.endDate) {
      query.timestamp = {};
      if (filters.startDate) query.timestamp.$gte = new Date(filters.startDate);
      if (filters.endDate) query.timestamp.$lte = new Date(filters.endDate);
    }

    // Aggregate stats by feature type
    const stats = await AuditLog.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$featureType",
          count: { $sum: 1 },
          successCount: {
            $sum: { $cond: [{ $eq: ["$metadata.status", "success"] }, 1, 0] },
          },
          failureCount: {
            $sum: { $cond: [{ $eq: ["$metadata.status", "failed"] }, 1, 0] },
          },
          lastUsed: { $max: "$timestamp" },
        },
      },
      { $sort: { lastUsed: -1 } },
    ]);

    return stats;
  } catch (error) {
    console.error("[AuditLog Error] Failed to get usage stats:", error.message);
    return [];
  }
};

/**
 * Get detailed usage history for a user
 * @param {string} userId - User ID
 * @param {object} options - { featureType?, limit?, skip? }
 */
const getUserUsageHistory = async (userId, options = {}) => {
  try {
    const query = { userId };
    if (options.featureType) query.featureType = options.featureType;

    const limit = options.limit || 50;
    const skip = options.skip || 0;

    const logs = await AuditLog.find(query)
      .select("featureType action metadata timestamp")
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    return logs;
  } catch (error) {
    console.error("[AuditLog Error] Failed to get usage history:", error.message);
    return [];
  }
};

/**
 * Get organization-wide usage analytics
 * @param {object} filters - { startDate?, endDate? }
 */
const getGlobalUsageStats = async (filters = {}) => {
  try {
    const query = {};

    if (filters.startDate || filters.endDate) {
      query.timestamp = {};
      if (filters.startDate) query.timestamp.$gte = new Date(filters.startDate);
      if (filters.endDate) query.timestamp.$lte = new Date(filters.endDate);
    }

    // Aggregate across all users
    const stats = await AuditLog.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$featureType",
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: "$userId" },
          successCount: {
            $sum: { $cond: [{ $eq: ["$metadata.status", "success"] }, 1, 0] },
          },
          failureCount: {
            $sum: { $cond: [{ $eq: ["$metadata.status", "failed"] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          featureType: "$_id",
          _id: 0,
          count: 1,
          successCount: 1,
          failureCount: 1,
          uniqueUsers: { $size: "$uniqueUsers" },
        },
      },
    ]);

    return stats;
  } catch (error) {
    console.error("[AuditLog Error] Failed to get global stats:", error.message);
    return [];
  }
};

module.exports = {
  logFeatureUsage,
  getUserUsageStats,
  getUserUsageHistory,
  getGlobalUsageStats,
};
