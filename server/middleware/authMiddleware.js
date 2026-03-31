const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Protect middleware — verifies local JWT and attaches user to req.user
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401);
      throw new Error("No token provided, authorization denied");
    }

    const token = authHeader.split(" ")[1];
    
    // Verify local JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user (without password) to request
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      res.status(401);
      throw new Error("User not found");
    }

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      res.status(401);
      error.message = "Invalid or expired token";
    }
    next(error);
  }
};

module.exports = { protect };
