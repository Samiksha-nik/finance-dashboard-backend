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

module.exports = {
  PORT,
  MONGO_URI,
};

