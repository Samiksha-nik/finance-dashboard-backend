const jwt = require("jsonwebtoken");

const { JWT_SECRET } = require("../utils/env"); // JWT_SECRET from .env
const User = require("../models/User");

function signToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
    },
    JWT_SECRET
  );
}

async function register(req, res, next) {
  try {
    const { name, email, password, role, status } = req.body || {};

    const user = await User.create({
      name,
      email,
      password,
      role,
      status,
    });

    const token = signToken(user);

    res.status(201).json({ token });
  } catch (err) {
    // Handle Mongo duplicate key errors (unique email).
    if (err?.code === 11000) {
      return res.status(409).json({ error: "Email already in use" });
    }
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};

    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken(user);

    res.status(200).json({ token });
  } catch (err) {
    return next(err);
  }
}

module.exports = { register, login };

