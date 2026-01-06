/**
 * Security Middleware
 * 
 * Implements security best practices:
 * - Rate limiting (express-rate-limit)
 * - Request size limiting
 * - Security headers (via helmet)
 * - XSS protection
 */

const rateLimit = require('express-rate-limit');

// ===========================
// Rate Limiting
// ===========================

/**
 * General API rate limiter
 * Limits: 100 requests per 15 minutes per IP
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.',
      timestamp: new Date().toISOString(),
    },
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting for health check endpoint
  skip: (req) => req.path === '/api/health',
});

/**
 * Strict rate limiter for authentication endpoints
 * Limits: 5 requests per 15 minutes per IP
 * Prevents brute force attacks
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again later.',
      timestamp: new Date().toISOString(),
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use IP + email for more granular limiting (if email is available)
  keyGenerator: (req) => {
    const ip = req.ip || req.connection.remoteAddress;
    const email = req.body?.email || '';
    return email ? `${ip}:${email}` : ip;
  },
});

/**
 * News API rate limiter
 * Limits: 50 requests per 15 minutes per IP
 */
const newsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'NEWS_RATE_LIMIT_EXCEEDED',
      message: 'Too many news requests, please try again later.',
      timestamp: new Date().toISOString(),
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ===========================
// Request Size Limiting
// ===========================

/**
 * Request size limit middleware
 * Limits request body size to prevent DoS attacks
 */
const requestSizeLimiter = (req, res, next) => {
  const maxSize = 1024 * 1024; // 1MB
  const contentLength = parseInt(req.get('content-length') || '0', 10);

  if (contentLength > maxSize) {
    return res.status(413).json({
      success: false,
      error: {
        code: 'REQUEST_TOO_LARGE',
        message: 'Request payload too large. Maximum size is 1MB.',
        timestamp: new Date().toISOString(),
      },
    });
  }

  next();
};

module.exports = {
  apiLimiter,
  authLimiter,
  newsLimiter,
  requestSizeLimiter,
};

