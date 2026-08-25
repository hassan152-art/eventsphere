const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const { ApiError } = require('../utils/apiResponse');
const User = require('../models/User');

// Verifies JWT and attaches req.user. Use `protect` on any route that
// requires authentication.
const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query.token) {
    // Allows direct-link downloads (e.g. CSV report exports) where an
    // Authorization header can't be attached, such as window.open().
    token = req.query.token;
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized, no token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) throw new ApiError(401, 'User no longer exists');
    if (user.status === 'suspended') {
      throw new ApiError(403, 'Your account has been suspended');
    }

    req.user = user;
    next();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(401, 'Not authorized, token invalid or expired');
  }
});

// Attaches req.user if a valid token is present, but does not block the
// request otherwise. Useful for "visitor vs logged-in" behavior on public
// pages (e.g. showing a bookmark icon state).
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (err) {
      req.user = null;
    }
  }
  next();
});

module.exports = { protect, optionalAuth };
