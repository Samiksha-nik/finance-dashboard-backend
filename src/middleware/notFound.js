const { HttpError } = require("../utils/httpError");

function notFoundHandler(req, res, next) {
  return next(new HttpError(404, "Not Found", "NOT_FOUND"));
}

module.exports = { notFoundHandler };

