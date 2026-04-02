const express = require("express");
const cors = require("cors");

const routes = require("./routes");
const { globalErrorHandler } = require("./middleware/errorHandler");
const { notFoundHandler } = require("./middleware/notFound");

function createApp() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Routes
  app.use(routes);

  // 404 + global error handler
  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
}

module.exports = { createApp };

