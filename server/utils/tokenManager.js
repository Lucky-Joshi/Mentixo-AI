const jwt = require("jsonwebtoken");
const crypto = require("crypto");

/**
 * Generate an access token (short-lived, 15 minutes)
 * @param {string} userId - User ID
 * @returns {string} Signed JWT access token
 */
const generateAccessToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return jwt.sign({ id: userId, type: "access" }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
};

/**
 * Generate a refresh token (long-lived, 7 days)
 * @param {string} userId - User ID
 * @returns {string} Signed JWT refresh token
 */
const generateRefreshToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return jwt.sign({ id: userId, type: "refresh" }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

/**
 * Verify and decode an access token
 * @param {string} token - JWT access token
 * @returns {object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyAccessToken = (token) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable is not set");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== "access") {
      throw new Error("Invalid token type");
    }
    return decoded;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Access token expired");
    }
    throw new Error("Invalid access token: " + error.message);
  }
};

/**
 * Verify and decode a refresh token
 * @param {string} token - JWT refresh token
 * @returns {object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyRefreshToken = (token) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable is not set");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== "refresh") {
      throw new Error("Invalid token type");
    }
    return decoded;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Refresh token expired");
    }
    throw new Error("Invalid refresh token: " + error.message);
  }
};

/**
 * Hash a refresh token for secure storage
 * @param {string} token - Raw refresh token
 * @returns {string} SHA256 hash of token
 */
const hashRefreshToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashRefreshToken,
};
