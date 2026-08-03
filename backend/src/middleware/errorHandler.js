/**
 * Centralized error-handling middleware.
 * Catches all errors thrown or passed via next(error) and returns
 * a consistent JSON response shape.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Log error in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('❌ Error:', err.stack || err.message || err);
  }

  // ── Mongoose Validation Error ──
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation error.',
      errors,
    });
  }

  // ── Mongoose Duplicate Key Error ──
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `A record with this ${field} already exists.`,
      errors: [{ field, message: `Duplicate ${field}` }],
    });
  }

  // ── Mongoose Cast Error (bad ObjectId, etc.) ──
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  // ── JWT Errors ──
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token.',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired.',
      code: 'TOKEN_EXPIRED',
    });
  }

  // ── Multer File Size Error ──
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'File too large. Maximum size is 10MB.',
    });
  }

  // ── Custom App Errors (thrown with statusCode) ──
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error.';

  return res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Internal server error.' : message,
    ...(process.env.NODE_ENV !== 'production' && statusCode === 500 && { stack: err.stack }),
  });
};

module.exports = { errorHandler };
