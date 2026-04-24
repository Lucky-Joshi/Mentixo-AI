const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
  verifyRefreshToken,
  verifyRefreshTokenExists,
  revokeRefreshToken,
  revokeAllRefreshTokens,
  cleanupExpiredTokens,
} = require("../utils/tokenManager");

/**
 * Helper: Return tokens and user data
 */
const returnTokensAndUser = (accessToken, refreshToken, user) => ({
  success: true,
  accessToken,
  refreshToken,
  user: { id: user._id, name: user.name, email: user.email },
});

/**
 * POST /api/auth/signup
 * Body: { name, email, password }
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

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409);
      throw new Error("Email already registered");
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    await storeRefreshToken(user, refreshToken);

    console.log(`[AUTH] Signup: ${email} at ${new Date().toISOString()}`);

    res.status(201).json(returnTokensAndUser(accessToken, refreshToken, user));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("email and password are required");
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    await storeRefreshToken(user, refreshToken);

    console.log(`[AUTH] Login: ${email} at ${new Date().toISOString()}`);

    res.json(returnTokensAndUser(accessToken, refreshToken, user));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/refresh
 * Body: { refreshToken }
 * Returns new accessToken (and optionally new refreshToken)
 */
const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400);
      throw new Error("Refresh token is required");
    }

    // Verify JWT signature and structure
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      res.status(401);
      throw new Error(error.message);
    }

    // Check if token is in user's token list
    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401);
      throw new Error("User not found");
    }

    // Verify refresh token exists and hasn't been revoked
    if (!verifyRefreshTokenExists(user, refreshToken)) {
      res.status(401);
      throw new Error("Refresh token revoked or expired");
    }

    // Clean up expired tokens while we're at it
    await cleanupExpiredTokens(user);

    // Generate new access token (and optionally rotate refresh token)
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Revoke old refresh token and store new one
    await revokeRefreshToken(user, refreshToken);
    await storeRefreshToken(user, newRefreshToken);

    console.log(
      `[AUTH] Token Refresh: ${user.email} at ${new Date().toISOString()}`
    );

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
 * Body: { refreshToken } (optional - if not provided, logout current device only)
 * Header: Authorization: Bearer <accessToken>
 */
const logout = async (req, res, next) => {
  try {
    const { refreshToken, logoutAll } = req.body;
    const user = req.user; // Attached by authMiddleware

    if (!user) {
      res.status(401);
      throw new Error("User not found in request");
    }

    if (logoutAll) {
      // Logout from all devices (revoke all refresh tokens)
      await revokeAllRefreshTokens(user);
      console.log(
        `[AUTH] Logout All: ${user.email} at ${new Date().toISOString()}`
      );
      return res.json({ success: true, message: "Logged out from all devices" });
    }

    if (refreshToken) {
      // Logout from specific device (revoke specific refresh token)
      await revokeRefreshToken(user, refreshToken);
      console.log(
        `[AUTH] Logout: ${user.email} at ${new Date().toISOString()}`
      );
      return res.json({ success: true, message: "Logged out successfully" });
    }

    // Default: logout current device
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/sync
 * Called by Auth0 Action after login/signup
 * Body: { auth0Id, name, email }
 * Header: x-sync-secret (to verify the call is from Auth0)
 */
const syncAuth0User = async (req, res, next) => {
  try {
    const secret = req.headers["x-sync-secret"];
    if (secret !== process.env.AUTH0_SYNC_SECRET) {
      res.status(401);
      throw new Error("Unauthorized sync request");
    }

    const { auth0Id, name, email } = req.body;

    if (!auth0Id || !email) {
      res.status(400);
      throw new Error("auth0Id and email are required");
    }

    // Upsert — create if not exists, update if already there
    const user = await User.findOneAndUpdate(
      { auth0Id },
      {
        auth0Id,
        email,
        name: name || email.split("@")[0], // fallback name from email
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`[AUTH0 SYNC] ${email} at ${new Date().toISOString()}`);
    res.json({ success: true, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    next(error);
  }
};

module.exports = { signup, login, refreshAccessToken, logout, syncAuth0User };
