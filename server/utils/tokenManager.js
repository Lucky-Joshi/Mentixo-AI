const jwt = require("jsonwebtoken");
const crypto = require("crypto");

/**
 * Generate an access token (short-lived, 15 minutes)
 * @param {string} userId - User ID
 * @returns {string} Signed JWT access token
 */
const generateAccessToken = (userId) =>
  jwt.sign({ id: userId, type: "access" }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

/**
 * Generate a refresh token (long-lived, 7 days)
 * @param {string} userId - User ID
 * @returns {string} Signed JWT refresh token
 */
const generateRefreshToken = (userId) =>
  jwt.sign({ id: userId, type: "refresh" }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

/**
 * Verify and decode an access token
 * @param {string} token - JWT access token
 * @returns {object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== "access") {
      throw new Error("Invalid token type");
    }
    return decoded;
  } catch (error) {
    throw new Error(
      error.name === "TokenExpiredError"
        ? "Access token expired"
        : "Invalid access token"
    );
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== "refresh") {
      throw new Error("Invalid token type");
    }
    return decoded;
  } catch (error) {
    throw new Error(
      error.name === "TokenExpiredError"
        ? "Refresh token expired"
        : "Invalid refresh token"
    );
  }
};

/**
 * Hash a refresh token for secure storage
 * @param {string} token - Raw refresh token
 * @returns {string} SHA256 hash of token
 */
const hashRefreshToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

/**
 * Store a refresh token for a user
 * @param {object} user - Mongoose User document
 * @param {string} token - Raw refresh token
 * @returns {Promise<void>}
 */
const storeRefreshToken = async (user, token) => {
  const hashedToken = hashRefreshToken(token);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  user.refreshTokens.push({
    token: hashedToken,
    expiresAt,
  });

  // Keep only last 5 refresh tokens per user (cleanup old ones)
  if (user.refreshTokens.length > 5) {
    user.refreshTokens = user.refreshTokens.slice(-5);
  }

  await user.save();
};

/**
 * Verify a refresh token exists and is valid for a user
 * @param {object} user - Mongoose User document
 * @param {string} token - Raw refresh token to verify
 * @returns {boolean} True if token is valid and not expired
 */
const verifyRefreshTokenExists = (user, token) => {
  const hashedToken = hashRefreshToken(token);
  const now = new Date();

  return user.refreshTokens.some(
    (rt) =>
      rt.token === hashedToken &&
      rt.expiresAt > now // not expired
  );
};

/**
 * Revoke a specific refresh token
 * @param {object} user - Mongoose User document
 * @param {string} token - Raw refresh token to revoke
 * @returns {Promise<void>}
 */
const revokeRefreshToken = async (user, token) => {
  const hashedToken = hashRefreshToken(token);
  user.refreshTokens = user.refreshTokens.filter(
    (rt) => rt.token !== hashedToken
  );
  await user.save();
};

/**
 * Revoke all refresh tokens for a user (logout from all devices)
 * @param {object} user - Mongoose User document
 * @returns {Promise<void>}
 */
const revokeAllRefreshTokens = async (user) => {
  user.refreshTokens = [];
  await user.save();
};

/**
 * Clean up expired refresh tokens (run periodically)
 * @param {object} user - Mongoose User document
 * @returns {Promise<void>}
 */
const cleanupExpiredTokens = async (user) => {
  const now = new Date();
  user.refreshTokens = user.refreshTokens.filter((rt) => rt.expiresAt > now);
  if (user.refreshTokens.length > 0) {
    await user.save();
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashRefreshToken,
  storeRefreshToken,
  verifyRefreshTokenExists,
  revokeRefreshToken,
  revokeAllRefreshTokens,
  cleanupExpiredTokens,
};
