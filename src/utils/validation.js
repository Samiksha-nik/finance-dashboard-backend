function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidEmail(email) {
  if (typeof email !== "string") return false;
  const trimmed = email.trim().toLowerCase();
  // Simple, pragmatic email validation.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

function toLowerEnum(value, allowed) {
  if (typeof value !== "string") return null;
  const lowered = value.toLowerCase();
  const set = new Set(allowed.map((v) => v.toLowerCase()));
  if (!set.has(lowered)) return null;
  return lowered;
}

module.exports = {
  isNonEmptyString,
  isValidEmail,
  toLowerEnum,
};

