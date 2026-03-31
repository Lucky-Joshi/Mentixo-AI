const User = require("../models/User");

const LIMITS = {
  messages: 30, // chat + notes + quiz per day
  uploads: 5,   // file uploads per day
};

/**
 * Resets daily counters if the user's lastReset date is not today
 */
const resetIfNewDay = async (user) => {
  const today = new Date().toDateString();
  const lastReset = user.lastReset ? new Date(user.lastReset).toDateString() : null;

  if (lastReset !== today) {
    user.dailyUsage = 0;
    user.dailyUploads = 0;
    user.lastReset = new Date();
    await user.save();
  }
};

/**
 * Middleware for chat / notes / quiz routes
 * Checks and increments dailyUsage
 */
const checkMessageLimit = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    await resetIfNewDay(user);

    if (user.dailyUsage >= LIMITS.messages) {
      return res.status(429).json({
        success: false,
        message: "Daily limit exceeded",
        upgrade: true,
        limit: LIMITS.messages,
        used: user.dailyUsage,
      });
    }

    user.dailyUsage += 1;
    await user.save();

    // Attach remaining count so controllers can forward it
    req.usageRemaining = LIMITS.messages - user.dailyUsage;
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
    const user = await User.findById(req.user._id);
    await resetIfNewDay(user);

    if (user.dailyUploads >= LIMITS.uploads) {
      return res.status(429).json({
        success: false,
        message: "Daily upload limit exceeded",
        upgrade: true,
        limit: LIMITS.uploads,
        used: user.dailyUploads,
      });
    }

    user.dailyUploads += 1;
    await user.save();

    req.uploadRemaining = LIMITS.uploads - user.dailyUploads;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { checkMessageLimit, checkUploadLimit };
