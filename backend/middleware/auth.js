const { verifyToken } = require('../services/authService');
const { getUserPreferences } = require('../services/preferencesService');

// ===========================
// In-Memory Preferences Cache
// ===========================

/**
 * In-memory cache for user preferences
 * Reduces database queries by caching preferences for 5 minutes
 * Cache is automatically invalidated when preferences are updated
 */
const preferencesCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached preferences or fetch from database
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User preferences
 */
const getCachedPreferences = async (userId) => {
  const cached = preferencesCache.get(userId);

  // Check if cache is valid
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    console.log('✨ [cache] Using cached preferences for user:', {
      userId,
      categories: cached.data.categories
    });
    return cached.data;
  }

  // Cache miss or expired - fetch from database
  console.log('🔄 [cache] Cache miss/expired, fetching fresh preferences for user:', userId);
  const preferences = await getUserPreferences(userId);

  // Update cache
  preferencesCache.set(userId, {
    data: preferences,
    timestamp: Date.now(),
  });

  console.log('💾 [cache] Cached fresh preferences for user:', {
    userId,
    categories: preferences.categories
  });

  return preferences;
};

/**
 * Clear preferences cache for a user
 * Called when preferences are updated
 * @param {string} userId - User ID
 */
const clearPreferencesCache = (userId) => {
  const wasDeleted = preferencesCache.delete(userId);
  console.log('🧹 [cache] Cleared preferences cache for user:', {
    userId,
    success: wasDeleted,
    cacheSize: preferencesCache.size
  });
};

/**
 * Clear all preferences cache
 * Useful for testing or cache invalidation
 */
const clearAllPreferencesCache = () => {
  preferencesCache.clear();
};

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header and attaches user info to request
 *
 * Usage:
 *   app.get('/protected-route', authenticateToken, (req, res) => {
 *     // req.user is available here (includes id, email, categories)
 *     res.json({ user: req.user });
 *   });
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authenticateToken = async (req, res, next) => {
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

      // Debug log
      console.log('🔐 [auth] Token verified for user:', {
        userId: decoded.userId,
        email: decoded.email
      });

      // Fetch user preferences (categories) - uses cache
      const preferences = await getCachedPreferences(decoded.userId);

      // Attach user info to request object (includes preferences)
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        categories: preferences.categories,
      };

      // Debug log attached user
      console.log('✅ [auth] Request user set:', {
        userId: req.user.id,
        email: req.user.email
      });

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
 *       // User is authenticated (includes preferences)
 *     } else {
 *       // User is not authenticated
 *     }
 *   });
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const optionalAuth = async (req, res, next) => {
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

      // Fetch user preferences (uses cache)
      const preferences = await getCachedPreferences(decoded.userId);

      req.user = {
        id: decoded.userId,
        email: decoded.email,
        categories: preferences.categories,
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

/**
 * Admin middleware
 * Checks if authenticated user has admin role
 * 
 * NOTE: Currently, admin role is not implemented in the database.
 * For now, this middleware can be used with environment variable check
 * or can be extended when admin role is added to users table.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const requireAdmin = (req, res, next) => {
  // Check if user is authenticated
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_UNAUTHORIZED',
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
      },
    });
  }

  // TODO: When admin role is added to users table, check req.user.role === 'admin'
  // For now, check environment variable for admin email whitelist
  const adminEmails = process.env.ADMIN_EMAILS
    ? process.env.ADMIN_EMAILS.split(',').map((email) => email.trim())
    : [];

  if (adminEmails.length > 0 && !adminEmails.includes(req.user.email)) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'AUTH_FORBIDDEN',
        message: 'Admin access required',
        timestamp: new Date().toISOString(),
      },
    });
  }

  // If no admin emails configured, allow access (development mode)
  // In production, this should be restricted
  if (process.env.NODE_ENV === 'production' && adminEmails.length === 0) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'AUTH_FORBIDDEN',
        message: 'Admin access not configured',
        timestamp: new Date().toISOString(),
      },
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAdmin,
  clearPreferencesCache,
  clearAllPreferencesCache,
};

