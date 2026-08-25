const { validationResult } = require('express-validator');
const { ApiError } = require('../utils/apiResponse');

// Runs after any express-validator chain and turns failures into a
// standard ApiError so errorHandler formats them consistently.
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array().map((e) => ({ field: e.path, message: e.msg })));
  }
  next();
};

module.exports = validate;
