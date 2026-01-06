/**
 * Error Handler Utilities
 * 
 * Provides functions for parsing and displaying API errors
 * Based on standardized error format from backend (see ERROR_CODES.md)
 */

/**
 * Error message mappings (English-only)
 * Maps error codes to user-friendly messages
 */
const ERROR_MESSAGES = {
  // Authentication
  AUTH_INVALID_CREDENTIALS: 'Invalid email or password',
  AUTH_EMAIL_EXISTS: 'This email is already registered',
  AUTH_INVALID_EMAIL: 'Invalid email format',
  AUTH_WEAK_PASSWORD: 'Password does not meet requirements',
  AUTH_TOKEN_EXPIRED: 'Session expired. Please login again',
  AUTH_TOKEN_INVALID: 'Invalid session. Please login again',
  AUTH_UNAUTHORIZED: 'You need to login for this operation',
  AUTH_FORBIDDEN: "You don't have permission for this operation",

  // User Preferences
  PREF_INVALID_CATEGORY: 'Invalid category selected',
  PREF_UPDATE_FAILED: 'Failed to update preferences',
  PREF_NOT_FOUND: 'User preferences not found',

  // Saved Articles
  SAVED_ARTICLE_DUPLICATE: 'Article is already saved',
  SAVED_ARTICLE_NOT_FOUND: 'Saved article not found',
  SAVED_ARTICLE_SAVE_FAILED: 'Failed to save article',
  SAVED_ARTICLE_FETCH_FAILED: 'Failed to load saved articles',
  SAVED_ARTICLE_DELETE_FAILED: 'Failed to delete saved article',

  // News API
  NEWS_API_INVALID_KEY: 'News service configuration error',
  NEWS_API_RATE_LIMIT: 'Too many requests. Please try again later',
  NEWS_API_SERVER_ERROR: 'News service is currently unavailable',
  NEWS_API_TIMEOUT: 'News service did not respond (10 second timeout)',
  NEWS_NETWORK_ERROR: 'Unable to connect to news service',
  NEWS_RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later',
  NEWS_INVALID_CATEGORY: 'Invalid news category',
  NEWS_FETCH_FAILED: 'Failed to load news',

  // System
  SYS_INTERNAL_ERROR: 'An error occurred. Please try again later',
  SYS_DATABASE_ERROR: 'Database error',
  SYS_VALIDATION_ERROR: 'Invalid input data',
  SYS_NETWORK_ERROR: 'Network connection error',
  SYS_TIMEOUT_ERROR: 'Request timeout',

  // Validation
  VAL_MISSING_FIELD: 'Required field is missing',
  VAL_INVALID_FORMAT: 'Invalid data format',
  VAL_OUT_OF_RANGE: 'Value out of allowed range',
};

/**
 * Parse error from API response
 * Handles both standardized error format and unexpected error formats
 * 
 * @param {Object|Error} error - Error object from API or catch block
 * @returns {Object} Parsed error object with code, message, and details
 */
export const parseError = (error) => {
  // Handle Error objects
  if (error instanceof Error) {
    return {
      code: 'SYS_INTERNAL_ERROR',
      message: error.message || 'An unexpected error occurred',
      details: null,
    };
  }

  // Handle standardized API error format
  if (error && error.error) {
    return {
      code: error.error.code || 'SYS_INTERNAL_ERROR',
      message: error.error.message || getErrorMessage(error.error.code),
      details: error.error.details || null,
    };
  }

  // Handle error object with code directly
  if (error && error.code) {
    return {
      code: error.code,
      message: error.message || getErrorMessage(error.code),
      details: error.details || null,
    };
  }

  // Fallback for unknown error format
  return {
    code: 'SYS_INTERNAL_ERROR',
    message: error?.message || 'An unexpected error occurred',
    details: null,
  };
};

/**
 * Get user-friendly error message for an error code
 * 
 * @param {string} errorCode - Error code (e.g., 'AUTH_INVALID_CREDENTIALS')
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (errorCode) => {
  if (!errorCode) {
    return 'An unexpected error occurred';
  }

  return ERROR_MESSAGES[errorCode] || `Error: ${errorCode}`;
};

/**
 * Extract error message from error object
 * Convenience function that combines parseError and getErrorMessage
 * 
 * @param {Object|Error} error - Error object from API or catch block
 * @returns {string} User-friendly error message
 */
export const extractErrorMessage = (error) => {
  const parsed = parseError(error);
  return parsed.message;
};

/**
 * Get error message from error object (alias for extractErrorMessage)
 * @param {Object|Error} error - Error object from API or catch block
 * @returns {string} User-friendly error message
 */
export const getErrorFromObject = (error) => {
  return extractErrorMessage(error);
};

/**
 * Extract error code from error object
 * 
 * @param {Object|Error} error - Error object from API or catch block
 * @returns {string} Error code
 */
export const getErrorCode = (error) => {
  const parsed = parseError(error);
  return parsed.code;
};

/**
 * Check if error is a specific error code
 * 
 * @param {Object|Error} error - Error object from API or catch block
 * @param {string} errorCode - Error code to check against
 * @returns {boolean} True if error matches the code
 */
export const isErrorCode = (error, errorCode) => {
  const code = getErrorCode(error);
  return code === errorCode;
};

/**
 * Check if error is an authentication error
 * 
 * @param {Object|Error} error - Error object from API or catch block
 * @returns {boolean} True if error is authentication-related
 */
export const isAuthError = (error) => {
  const code = getErrorCode(error);
  return code.startsWith('AUTH_');
};

/**
 * Check if error is a validation error
 * 
 * @param {Object|Error} error - Error object from API or catch block
 * @returns {boolean} True if error is validation-related
 */
export const isValidationError = (error) => {
  const code = getErrorCode(error);
  return code.startsWith('VAL_') || code === 'SYS_VALIDATION_ERROR';
};

/**
 * Check if error is a network error
 * 
 * @param {Object|Error} error - Error object from API or catch block
 * @returns {boolean} True if error is network-related
 */
export const isNetworkError = (error) => {
  const code = getErrorCode(error);
  return code.includes('NETWORK') || code.includes('TIMEOUT');
};

/**
 * Format error for display
 * Returns a formatted string suitable for user display
 * 
 * @param {Object|Error} error - Error object from API or catch block
 * @param {Object} options - Formatting options
 * @param {boolean} options.includeDetails - Include error details if available
 * @returns {string} Formatted error message
 */
export const formatErrorForDisplay = (error, options = {}) => {
  const { includeDetails = false } = options;
  const parsed = parseError(error);

  let message = parsed.message;

  // Add details if requested and available
  if (includeDetails && parsed.details) {
    if (Array.isArray(parsed.details)) {
      const detailMessages = parsed.details
        .map((detail) => detail.message || detail.msg)
        .filter(Boolean);
      if (detailMessages.length > 0) {
        message += `: ${detailMessages.join(', ')}`;
      }
    } else if (typeof parsed.details === 'object') {
      const detailStr = JSON.stringify(parsed.details);
      message += `: ${detailStr}`;
    }
  }

  return message;
};

