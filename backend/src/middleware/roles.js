const { ROLES } = require('../config/constants');

/**
 * Role-based authorization middleware.
 * Must be used AFTER authenticate middleware.
 * @param  {...string} allowedRoles - e.g. requireRole(ROLES.ADMIN)
 * @returns {Function} Express middleware
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
      });
    }

    next();
  };
};

module.exports = { requireRole };
