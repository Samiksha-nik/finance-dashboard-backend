const crypto = require("crypto");

function sha256(input) {
  return crypto.createHash("sha256").update(String(input)).digest("hex");
}

function hashToken(token) {
  return sha256(token);
}

module.exports = { hashToken };

