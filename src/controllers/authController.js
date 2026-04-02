const jwt = require("jsonwebtoken");

const {
  JWT_SECRET,
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_SECRET,
} = require("../utils/env");
const { RefreshToken, AccessTokenBlacklist } = require("../models");
const User = require("../models/User");
const { HttpError } = require("../utils/httpError");
const { isNonEmptyString, isValidEmail, toLowerEnum } = require("../utils/validation");
const { hashToken } = require("../utils/tokenHash");

function createAccessToken(user) {
  return jwt.sign(
    {
      tokenType: "access",
      userId: user._id.toString(),
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    }
  );
}

function decodeExpToDate(decoded) {
  if (!decoded?.exp) return null;
  return new Date(decoded.exp * 1000);
}

function createRefreshTokenPayload(user) {
  return {
    tokenType: "refresh",
    userId: user._id.toString(),
    role: user.role,
  };
}

async function createAndStoreRefreshToken(user) {
  const refreshToken = jwt.sign(createRefreshTokenPayload(user), REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });

  const decoded = jwt.decode(refreshToken);
  const expiresAt = decodeExpToDate(decoded);

  // Store refresh token securely (hash only).
  const tokenHash = hashToken(refreshToken);
  await RefreshToken.create({
    user: user._id,
    tokenHash,
    expiresAt,
  });

  return refreshToken;
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

    const token = createAccessToken(user);
    const refreshToken = await createAndStoreRefreshToken(user);

    res.status(201).json({ token, refreshToken });
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

    const token = createAccessToken(user);
    const refreshToken = await createAndStoreRefreshToken(user);

    res.status(200).json({ token, refreshToken });
  } catch (err) {
    return next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body || {};
    if (!isNonEmptyString(refreshToken)) {
      throw new HttpError(400, "refreshToken is required", "VALIDATION_REFRESH_TOKEN");
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    } catch (err) {
      throw new HttpError(401, "Invalid or expired refresh token", "REFRESH_INVALID");
    }

    if (decoded?.tokenType !== "refresh") {
      throw new HttpError(401, "Invalid refresh token type", "REFRESH_INVALID_TYPE");
    }

    const tokenHash = hashToken(refreshToken);
    const record = await RefreshToken.findOne({
      tokenHash,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      throw new HttpError(401, "Refresh token revoked", "REFRESH_REVOKED");
    }

    // Rotate refresh token (revokes old token record).
    record.revokedAt = new Date();
    await record.save();

    const user = await User.findById(record.user);
    if (!user) throw new HttpError(401, "User not found", "REFRESH_USER_NOT_FOUND");

    const token = createAccessToken(user);
    const newRefreshToken = await createAndStoreRefreshToken(user);

    res.status(200).json({ token, refreshToken: newRefreshToken });
  } catch (err) {
    return next(err);
  }
}

async function logout(req, res, next) {
  try {
    // Access token comes from Authorization header.
    const authHeader = req.headers.authorization;
    let accessToken = null;
    if (authHeader && typeof authHeader === "string") {
      const parts = authHeader.split(" ");
      if (parts[0] === "Bearer") accessToken = parts[1] || null;
    }

    const { refreshToken } = req.body || {};

    // Blacklist access token until its expiry.
    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, JWT_SECRET);
        const expiresAt = decodeExpToDate(decoded);
        const tokenHash = hashToken(accessToken);

        if (expiresAt && expiresAt > new Date()) {
          await AccessTokenBlacklist.updateOne(
            { tokenHash },
            {
              $set: { expiresAt, user: decoded?.userId || null, revokedAt: null },
            },
            { upsert: true }
          );
        }
      } catch (err) {
        // If token is already expired/invalid, nothing to blacklist.
      }
    }

    // Revoke refresh token record if provided.
    if (isNonEmptyString(refreshToken)) {
      const tokenHash = hashToken(refreshToken);
      await RefreshToken.updateMany(
        { tokenHash, revokedAt: null },
        { $set: { revokedAt: new Date() } }
      );
    }

    res.status(200).json({ success: true });
  } catch (err) {
    return next(err);
  }
}

module.exports = { register, login, refresh, logout };

