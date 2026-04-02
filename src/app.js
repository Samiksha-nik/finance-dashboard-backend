const express = require("express");
const cors = require("cors");

const routes = require("./routes");
const { globalErrorHandler } = require("./middleware/errorHandler");
const { notFoundHandler } = require("./middleware/notFound");
const swaggerUi = require("swagger-ui-express");
const { swaggerSpec } = require("./swagger");

function createApp() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Swagger docs (public)
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Routes
  app.use(routes);

  // 404 + global error handler
  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
}

module.exports = { createApp };

