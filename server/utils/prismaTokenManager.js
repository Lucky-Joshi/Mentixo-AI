const prisma = require("../lib/prisma");

/**
 * Store a refresh token in the database
 */
const storeRefreshToken = async (userId, token) => {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });
};

/**
 * Verify if a refresh token exists and is not expired
 */
const verifyRefreshTokenExists = async (userId, token) => {
  const refreshToken = await prisma.refreshToken.findUnique({
    where: { token },
  });

  if (!refreshToken) return false;
  if (refreshToken.userId !== userId) return false;
  if (new Date() > refreshToken.expiresAt) return false;

  return true;
};

/**
 * Revoke a specific refresh token
 */
const revokeRefreshToken = async (userId, token) => {
  await prisma.refreshToken.deleteMany({
    where: {
      token,
      userId,
    },
  });
};

/**
 * Revoke all refresh tokens for a user (logout from all devices)
 */
const revokeAllRefreshTokens = async (userId) => {
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });
};

/**
 * Clean up expired refresh tokens for a user
 */
const cleanupExpiredTokens = async (userId) => {
  await prisma.refreshToken.deleteMany({
    where: {
      userId,
      expiresAt: {
        lt: new Date(),
      },
    },
  });
};

module.exports = {
  storeRefreshToken,
  verifyRefreshTokenExists,
  revokeRefreshToken,
  revokeAllRefreshTokens,
  cleanupExpiredTokens,
};
