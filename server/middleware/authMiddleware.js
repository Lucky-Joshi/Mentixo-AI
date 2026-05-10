const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const { verifyAccessToken } = require("../utils/tokenManager");

/**
 * Protect middleware — verifies local JWT access token and attaches user to req.user
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401);
      throw new Error("No token provided, authorization denied");
    }

    const token = authHeader.split(" ")[1];

    // Verify access token
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (error) {
      res.status(401);
      throw new Error(error.message);
    }

    // Attach user (without password) to request
    req.user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, dailyUsage: true, dailyUploads: true, lastReset: true },
    });

    if (!req.user) {
      res.status(401);
      throw new Error("User not found");
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { protect };
