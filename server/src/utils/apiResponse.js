// Standard API response helpers, per SRS section 30 (Error Handling)

class ApiError extends Error {
  constructor(statusCode, message, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

const success = (res, statusCode, message, data = {}) => {
  return res.status(statusCode).json({ success: true, message, data });
};

const failure = (res, statusCode, message, error = null) => {
  return res.status(statusCode).json({ success: false, message, error });
};

module.exports = { ApiError, success, failure };
