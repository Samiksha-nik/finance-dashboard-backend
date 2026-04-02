const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    // Stored as a bcrypt hash.
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // Require explicit inclusion when verifying passwords.
    },
    role: {
      type: String,
      enum: ["viewer", "analyst", "admin"],
      default: "viewer",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function preSave(next) {
  try {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
    return next();
  } catch (err) {
    return next(err);
  }
});

userSchema.methods.comparePassword = async function comparePassword(
  candidatePassword
) {
  if (!this.password) {
    throw new Error(
      "User password is not loaded. Query the user with `select('+password')`."
    );
  }

  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);

