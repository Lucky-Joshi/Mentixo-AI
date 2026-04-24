const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    auth0Id: { type: String, unique: true, sparse: true },
    // Usage tracking
    dailyUsage: { type: Number, default: 0 },
    dailyUploads: { type: Number, default: 0 },
    lastReset: { type: Date, default: null },
    // Refresh tokens for token rotation
    refreshTokens: [
      {
        token: { type: String, required: true },
        expiresAt: { type: Date, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Index for fast cleanup of expired refresh tokens
userSchema.index({ "refreshTokens.expiresAt": 1 });

module.exports = mongoose.model("User", userSchema);
