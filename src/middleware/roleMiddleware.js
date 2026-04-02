const { HttpError } = require("../utils/httpError");

function authorizeRoles(allowedRoles) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  const allowed = new Set(roles.filter(Boolean).map((r) => String(r).toLowerCase()));

  return function roleMiddleware(req, res, next) {
    const userRole = req?.user?.role ? String(req.user.role).toLowerCase() : null;

    if (!userRole || !allowed.has(userRole)) {
      return next(new HttpError(403, "Forbidden", "FORBIDDEN"));
    }

    next();
  };
}

module.exports = { authorizeRoles };

