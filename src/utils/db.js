const mongoose = require("mongoose");

const { MONGO_URI } = require("./env");

async function connectMongo() {
  if (mongoose.connection.readyState === 1) return;

  await mongoose.connect(MONGO_URI);
  console.log("MongoDB connected");
}

module.exports = { connectMongo };

