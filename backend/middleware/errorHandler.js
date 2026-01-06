/**
 * Standardized error handling middleware
 * Formats errors according to ERROR_CODES.md specification
 * 
 * Usage:
 *   app.use(errorHandler);
 * 
 * In controllers:
 *   next(new Error('Message'));
 *   // or
 *   const err = new Error('Message');
 *   err.statusCode = 400;
 *   err.errorCode = 'AUTH_INVALID_EMAIL';
 *   next(err);
 */
const errorHandler = (err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error('Error:', err);

  // Default error values
  const statusCode = err.statusCode || err.status || 500;
  // Support both errorCode and code properties (for compatibility)
  const errorCode = err.errorCode || err.code || 'SYS_INTERNAL_ERROR';
  const message = err.message || 'Internal server error';

  // Standardized error response format
  const errorResponse = {
    success: false,
    error: {
      code: errorCode,
      message,
      timestamp: new Date().toISOString(),
    },
  };

  // Add details if available (for validation errors, etc.)
  if (err.details) {
    errorResponse.error.details = err.details;
  }

  // Don't expose internal error details in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    errorResponse.error.message = 'Internal server error';
  }

  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;

