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
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
