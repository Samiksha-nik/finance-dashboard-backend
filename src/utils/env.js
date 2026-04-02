require("dotenv").config();

function parsePort(value, defaultPort) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return defaultPort;
  return num;
}

const PORT = parsePort(process.env.PORT, 3000);

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

const MONGO_URI = requiredEnv("MONGO_URI");

const JWT_SECRET = requiredEnv("JWT_SECRET");

const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || "1h";
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "30d";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || JWT_SECRET;

module.exports = {
  PORT,
  MONGO_URI,
  JWT_SECRET,
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_SECRET,
};

