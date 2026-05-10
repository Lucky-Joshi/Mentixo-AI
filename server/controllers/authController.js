const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/tokenManager");
const {
  storeRefreshToken,
  verifyRefreshTokenExists,
  revokeRefreshToken,
  revokeAllRefreshTokens,
  cleanupExpiredTokens,
} = require("../utils/prismaTokenManager");

// Helper: return tokens + minimal user data
const returnTokensAndUser = (accessToken, refreshToken, user) => ({
  success: true,
  accessToken,
  refreshToken,
  user: { id: user.id, name: user.name, email: user.email },
});

/**
 * POST /api/auth/signup
 */
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("name, email, and password are required");
    }

    if (password.length < 6) {
      res.status(400);
      throw new Error("Password must be at least 6 characters");
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409);
      throw new Error("Email already registered");
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    await storeRefreshToken(user.id, refreshToken);

    console.log(`[AUTH] Signup: ${email} at ${new Date().toISOString()}`);

    res.status(201).json(returnTokensAndUser(accessToken, refreshToken, user));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("email and password are required");
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    await storeRefreshToken(user.id, refreshToken);

    console.log(`[AUTH] Login: ${email} at ${new Date().toISOString()}`);

    res.json(returnTokensAndUser(accessToken, refreshToken, user));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/refresh
 */
const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400);
      throw new Error("Refresh token is required");
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      res.status(401);
      throw new Error(error.message);
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      res.status(401);
      throw new Error("User not found");
    }

    if (!(await verifyRefreshTokenExists(user.id, refreshToken))) {
      res.status(401);
      throw new Error("Refresh token revoked or expired");
    }

    await cleanupExpiredTokens(user.id);

    const newAccessToken = generateAccessToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    await revokeRefreshToken(user.id, refreshToken);
    await storeRefreshToken(user.id, newRefreshToken);

    console.log(`[AUTH] Token Refresh: ${user.email} at ${new Date().toISOString()}`);

    res.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    const { refreshToken, logoutAll } = req.body;
    const user = req.user; // attached by auth middleware

    if (!user) {
      res.status(401);
      throw new Error("User not found in request");
    }

    if (logoutAll) {
      await revokeAllRefreshTokens(user.id);
      console.log(`[AUTH] Logout All: ${user.email} at ${new Date().toISOString()}`);
      return res.json({ success: true, message: "Logged out from all devices" });
    }

    if (refreshToken) {
      await revokeRefreshToken(user.id, refreshToken);
      console.log(`[AUTH] Logout: ${user.email} at ${new Date().toISOString()}`);
      return res.json({ success: true, message: "Logged out successfully" });
    }

    // Default: logout current device (no token revocation needed)
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { signup, login, refreshAccessToken, logout };
