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

const winston = require('winston');

// Winston logger for error handling
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'error-handler' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// In production, also log to file
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error-handler-error.log',
      level: 'error',
    })
  );
  logger.add(
    new winston.transports.File({
      filename: 'logs/error-handler.log',
    })
  );
}

const errorHandler = (err, req, res, next) => {
  // Default error values
  const statusCode = err.statusCode || err.status || 500;
  // Support both errorCode and code properties (for compatibility)
  const errorCode = err.errorCode || err.code || 'SYS_INTERNAL_ERROR';
  const message = err.message || 'Internal server error';

  // Log error with appropriate level
  const logData = {
    errorCode,
    statusCode,
    message,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  };

  // Add request details for debugging (not in production)
  if (process.env.NODE_ENV !== 'production') {
    logData.query = req.query;
    logData.params = req.params;
    if (err.details) {
      logData.details = err.details;
    }
    if (err.stack) {
      logData.stack = err.stack;
    }
  }

  // Log based on status code
  if (statusCode >= 500) {
    logger.error('Server error', logData);
  } else if (statusCode >= 400) {
    logger.warn('Client error', logData);
  } else {
    logger.info('Error handled', logData);
  }

  // Standardized error response format (per ERROR_CODES.md)
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

