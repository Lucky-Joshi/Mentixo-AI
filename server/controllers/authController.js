const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/** Generate a signed JWT for a given user ID */
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

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

    console.log(`[AUTH] Signup: ${email} at ${new Date().toISOString()}`);

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email },
    });
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

    console.log(`[AUTH] Login: ${email} at ${new Date().toISOString()}`);

    res.json({
      success: true,
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email },
    });
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

module.exports = { signup, login, syncAuth0User };
