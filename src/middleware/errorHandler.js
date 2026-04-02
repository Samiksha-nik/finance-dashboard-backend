function globalErrorHandler(err, req, res, next) {
  // Ensure Express treats this as an error middleware.
  // eslint-disable-next-line no-unused-vars
  const _ = next;

  let status =
    err?.statusCode ||
    err?.status ||
    (err?.name === "ValidationError" ? 400 : 500);

  let message =
    err?.message && typeof err.message === "string"
      ? err.message
      : "Internal Server Error";

  let code = err?.code;

  // Mongo/Mongoose niceties
  if (err?.name === "ValidationError") {
    status = 400;
  }

  if (err?.code === 11000) {
    status = 409;
    message = "Duplicate key";
    code = "DUPLICATE_KEY";
  }

  const isProd = process.env.NODE_ENV === "production";

  res.status(status).json({
    success: false,
    error: {
      message,
      code: code || status,
    },
    ...(isProd ? null : { stack: err?.stack }),
  });
}

module.exports = { globalErrorHandler };

