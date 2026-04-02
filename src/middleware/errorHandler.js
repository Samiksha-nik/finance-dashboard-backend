function globalErrorHandler(err, req, res, next) {
  // Ensure Express treats this as an error middleware.
  // eslint-disable-next-line no-unused-vars
  const _ = next;

  const status = err?.statusCode || err?.status || 500;
  const message =
    err?.message && typeof err.message === "string"
      ? err.message
      : "Internal Server Error";

  const isProd = process.env.NODE_ENV === "production";

  res.status(status).json({
    error: message,
    ...(isProd ? null : { stack: err?.stack }),
  });
}

module.exports = { globalErrorHandler };

