const prisma = require("../lib/prisma");

/**
 * Log feature usage to audit trail
 * @param {string} userId - User ID
 * @param {string} featureType - "chat", "notes", "quiz", or "upload"
 * @param {string} action - Specific action (e.g., "message_sent")
 * @param {object} options - Optional { resourceId, metadata }
 */
const logFeatureUsage = async (userId, featureType, action, options = {}) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        featureType,
        action,
        resourceId: options.resourceId,
        metadata: options.metadata ? JSON.stringify(options.metadata) : null,
        timestamp: new Date(),
      },
    });
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
    const where = { userId };

    if (filters.featureType) {
      where.featureType = filters.featureType;
    }

    if (filters.startDate || filters.endDate) {
      where.timestamp = {};
      if (filters.startDate) where.timestamp.gte = new Date(filters.startDate);
      if (filters.endDate) where.timestamp.lte = new Date(filters.endDate);
    }

    // Get all logs matching the filter
    const logs = await prisma.auditLog.findMany({
      where,
      select: { featureType: true, metadata: true, timestamp: true },
    });

    // Group by feature type
    const stats = {};
    logs.forEach((log) => {
      if (!stats[log.featureType]) {
        stats[log.featureType] = {
          _id: log.featureType,
          count: 0,
          successCount: 0,
          failureCount: 0,
          lastUsed: null,
        };
      }

      stats[log.featureType].count++;

      try {
        const metadata = log.metadata ? JSON.parse(log.metadata) : {};
        if (metadata.status === "success") {
          stats[log.featureType].successCount++;
        } else if (metadata.status === "failed") {
          stats[log.featureType].failureCount++;
        }
      } catch (e) {
        // Ignore JSON parse errors
      }

      if (!stats[log.featureType].lastUsed || log.timestamp > stats[log.featureType].lastUsed) {
        stats[log.featureType].lastUsed = log.timestamp;
      }
    });

    return Object.values(stats).sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed));
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
    const where = { userId };
    if (options.featureType) where.featureType = options.featureType;

    const limit = options.limit || 50;
    const skip = options.skip || 0;

    const logs = await prisma.auditLog.findMany({
      where,
      select: { featureType: true, action: true, metadata: true, timestamp: true },
      orderBy: { timestamp: "desc" },
      take: limit,
      skip: skip,
    });

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
    const where = {};

    if (filters.startDate || filters.endDate) {
      where.timestamp = {};
      if (filters.startDate) where.timestamp.gte = new Date(filters.startDate);
      if (filters.endDate) where.timestamp.lte = new Date(filters.endDate);
    }

    // Get all logs matching the filter
    const logs = await prisma.auditLog.findMany({
      where,
      select: { featureType: true, userId: true, metadata: true },
    });

    // Group by feature type
    const stats = {};
    const uniqueUsers = new Set();

    logs.forEach((log) => {
      if (!stats[log.featureType]) {
        stats[log.featureType] = {
          featureType: log.featureType,
          count: 0,
          successCount: 0,
          failureCount: 0,
          uniqueUsers: new Set(),
        };
      }

      stats[log.featureType].count++;
      stats[log.featureType].uniqueUsers.add(log.userId);

      try {
        const metadata = log.metadata ? JSON.parse(log.metadata) : {};
        if (metadata.status === "success") {
          stats[log.featureType].successCount++;
        } else if (metadata.status === "failed") {
          stats[log.featureType].failureCount++;
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
    });

    // Convert Sets to counts
    return Object.values(stats).map((stat) => ({
      featureType: stat.featureType,
      count: stat.count,
      successCount: stat.successCount,
      failureCount: stat.failureCount,
      uniqueUsers: stat.uniqueUsers.size,
    }));
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
