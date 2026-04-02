const { PORT } = require("./src/utils/env");
const { connectMongo } = require("./src/utils/db");
const { createApp } = require("./src/app");

async function startServer() {
  await connectMongo();
  const app = createApp();
  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
}

startServer().catch((err) => {
  console.error("Failed to start server:", err?.message || err);
  process.exit(1);
});

module.exports = { startServer };

