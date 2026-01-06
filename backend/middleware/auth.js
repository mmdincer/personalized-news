const { verifyToken } = require('../services/authService');

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header and attaches user info to request
 * 
 * Usage:
 *   app.get('/protected-route', authenticateToken, (req, res) => {
 *     // req.user is available here
 *     res.json({ user: req.user });
 *   });
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authenticateToken = (req, res, next) => {
  try {
    // Get token from Authorization header
    // Format: "Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_UNAUTHORIZED',
          message: 'No token provided. Please include Authorization header.',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Extract token from "Bearer <token>" format
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_UNAUTHORIZED',
          message: 'Invalid authorization header format. Use: Bearer <token>',
          timestamp: new Date().toISOString(),
        },
      });
    }

    const token = parts[1];

    if (!token || token.trim().length === 0) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_UNAUTHORIZED',
          message: 'Token is required',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Verify token
    try {
      const decoded = verifyToken(token);

      // Attach user info to request object
      req.user = {
        id: decoded.userId,
        email: decoded.email,
      };

      // Continue to next middleware/route handler
      next();
    } catch (error) {
      // Handle token verification errors
      let errorCode = 'AUTH_TOKEN_INVALID';
      const statusCode = 401;
      let message = 'Invalid token';

      if (error.message.includes('expired')) {
        errorCode = 'AUTH_TOKEN_EXPIRED';
        message = 'Token has expired. Please login again.';
      } else if (error.message.includes('Invalid token')) {
        errorCode = 'AUTH_TOKEN_INVALID';
        message = 'Invalid token. Please login again.';
      }

      return res.status(statusCode).json({
        success: false,
        error: {
          code: errorCode,
          message,
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    // Unexpected error
    return res.status(500).json({
      success: false,
      error: {
        code: 'SYS_INTERNAL_ERROR',
        message: 'Authentication failed',
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * Optional authentication middleware
 * Similar to authenticateToken but doesn't fail if token is missing
 * Useful for routes that work with or without authentication
 * 
 * Usage:
 *   app.get('/optional-auth-route', optionalAuth, (req, res) => {
 *     if (req.user) {
 *       // User is authenticated
 *     } else {
 *       // User is not authenticated
 *     }
 *   });
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      // No token provided, continue without authentication
      req.user = null;
      return next();
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      // Invalid format, continue without authentication
      req.user = null;
      return next();
    }

    const token = parts[1];

    if (!token || token.trim().length === 0) {
      // Empty token, continue without authentication
      req.user = null;
      return next();
    }

    // Try to verify token
    try {
      const decoded = verifyToken(token);
      req.user = {
        id: decoded.userId,
        email: decoded.email,
      };
    } catch (error) {
      // Token invalid or expired, continue without authentication
      req.user = null;
    }

    next();
  } catch (error) {
    // Unexpected error, continue without authentication
    req.user = null;
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
};

