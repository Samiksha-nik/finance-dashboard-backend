const jwt = require("jsonwebtoken");

const { JWT_SECRET } = require("../utils/env"); // JWT_SECRET from .env
const User = require("../models/User");
const { HttpError } = require("../utils/httpError");
const { isNonEmptyString, isValidEmail, toLowerEnum } = require("../utils/validation");

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

    if (!isNonEmptyString(name)) {
      throw new HttpError(400, "Name is required", "VALIDATION_NAME");
    }
    if (!isValidEmail(email)) {
      throw new HttpError(400, "Valid email is required", "VALIDATION_EMAIL");
    }
    if (typeof password !== "string" || password.length < 6) {
      throw new HttpError(
        400,
        "Password must be at least 6 characters",
        "VALIDATION_PASSWORD"
      );
    }

    const normalizedRole = role
      ? toLowerEnum(role, ["viewer", "analyst", "admin"])
      : undefined;
    if (role && !normalizedRole) {
      throw new HttpError(400, "Invalid role", "VALIDATION_ROLE");
    }

    const normalizedStatus = status
      ? toLowerEnum(status, ["active", "inactive"])
      : undefined;
    if (status && !normalizedStatus) {
      throw new HttpError(400, "Invalid status", "VALIDATION_STATUS");
    }

    const user = await User.create({
      name,
      email: email.trim().toLowerCase(),
      password,
      role: normalizedRole,
      status: normalizedStatus,
    });

    const token = signToken(user);

    res.status(201).json({ token });
  } catch (err) {
    // Handle Mongo duplicate key errors (unique email).
    if (err?.code === 11000) {
      return next(new HttpError(409, "Email already in use", "EMAIL_DUPLICATE"));
    }
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!isValidEmail(email)) {
      throw new HttpError(400, "Valid email is required", "VALIDATION_EMAIL");
    }
    if (typeof password !== "string" || password.length === 0) {
      throw new HttpError(400, "Password is required", "VALIDATION_PASSWORD");
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
    if (!user) throw new HttpError(401, "Invalid credentials", "INVALID_CREDENTIALS");

    const ok = await user.comparePassword(password);
    if (!ok) throw new HttpError(401, "Invalid credentials", "INVALID_CREDENTIALS");

    const token = signToken(user);

    res.status(200).json({ token });
  } catch (err) {
    return next(err);
  }
}

module.exports = { register, login };

