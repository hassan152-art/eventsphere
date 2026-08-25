const { ApiError } = require('../utils/apiResponse');

// Role-Based Access Control middleware factory.
// Usage: router.post('/events', protect, authorize('organizer', 'admin'), handler)
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authorized, please login');
  }
  if (!allowedRoles.includes(req.user.role)) {
    throw new ApiError(403, `Role '${req.user.role}' is not permitted to perform this action`);
  }
  next();
};

module.exports = authorize;
