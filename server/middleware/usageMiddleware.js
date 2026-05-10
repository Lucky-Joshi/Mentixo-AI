const prisma = require("../lib/prisma");

const LIMITS = {
  messages: 30, // chat + notes + quiz per day
  uploads: 5,   // file uploads per day
};

/**
 * Resets daily counters if the user's lastReset date is not today
 */
const resetIfNewDay = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const today = new Date().toDateString();
  const lastReset = user.lastReset ? new Date(user.lastReset).toDateString() : null;

  if (lastReset !== today) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        dailyUsage: 0,
        dailyUploads: 0,
        lastReset: new Date(),
      },
    });
  }
};

/**
 * Middleware for chat / notes / quiz routes
 * Checks and increments dailyUsage
 */
const checkMessageLimit = async (req, res, next) => {
  try {
    await resetIfNewDay(req.user.id);

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (user.dailyUsage >= LIMITS.messages) {
      return res.status(429).json({
        success: false,
        message: "Daily limit exceeded",
        upgrade: true,
        limit: LIMITS.messages,
        used: user.dailyUsage,
      });
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: { dailyUsage: user.dailyUsage + 1 },
    });

    // Attach remaining count so controllers can forward it
    req.usageRemaining = LIMITS.messages - (user.dailyUsage + 1);
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware for /api/upload route
 * Checks and increments dailyUploads
 */
const checkUploadLimit = async (req, res, next) => {
  try {
    await resetIfNewDay(req.user.id);

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (user.dailyUploads >= LIMITS.uploads) {
      return res.status(429).json({
        success: false,
        message: "Daily upload limit exceeded",
        upgrade: true,
        limit: LIMITS.uploads,
        used: user.dailyUploads,
      });
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: { dailyUploads: user.dailyUploads + 1 },
    });

    req.uploadRemaining = LIMITS.uploads - (user.dailyUploads + 1);
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { checkMessageLimit, checkUploadLimit };
