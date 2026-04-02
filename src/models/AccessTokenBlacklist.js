const mongoose = require("mongoose");

const accessTokenBlacklistSchema = new mongoose.Schema(
  {
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: { type: Date, required: true, index: true },
    revokedAt: { type: Date, default: null },
    // Optional reference to help auditing/debugging.
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "AccessTokenBlacklist",
  accessTokenBlacklistSchema
);

