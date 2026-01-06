/**
 * News Routes
 *
 * Defines all news-related API endpoints
 */

const express = require('express');
const { query, param } = require('express-validator');
const newsController = require('../controllers/newsController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { ALLOWED_CATEGORIES } = require('../constants/categories');
const { newsLimiter } = require('../middleware/security');

const router = express.Router();

// ===========================
// Validation Rules
// ===========================

const categoryValidation = [
  param('category')
    .trim()
    .toLowerCase()
    .isIn(ALLOWED_CATEGORIES)
    .withMessage(
      `Invalid category. Allowed categories: ${ALLOWED_CATEGORIES.join(', ')}`
    ),
];

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50 (The Guardian API limit)')
    .toInt(),
];

// ===========================
// Public Routes
// ===========================

/**
 * @route   GET /api/news/:category
 * @desc    Get news by category
 * @access  Public
 * @params  category - One of: business, entertainment, general, health, science, sports, technology
 * @query   page (optional) - Page number (default: 1)
 * @query   limit (optional) - Results per page (default: 20, max: 100)
 */
router.get(
  '/:category',
  newsLimiter,
  [...categoryValidation, ...paginationValidation],
  newsController.getNewsByCategory
);

// ===========================
// Protected Routes (Require Authentication)
// ===========================

/**
 * @route   GET /api/news
 * @desc    Get personalized news based on user preferences
 * @access  Private (requires authentication)
 * @query   page (optional) - Page number (default: 1)
 * @query   limit (optional) - Results per page (default: 20, max: 100)
 * @note    Rate limited: 50 requests per 15 minutes per IP
 */
router.get(
  '/',
  newsLimiter,
  authenticateToken,
  paginationValidation,
  newsController.getPersonalizedNews
);

// ===========================
// Admin/Stats Routes
// ===========================

/**
 * @route   GET /api/news/stats/rate-limit
 * @desc    Get rate limit statistics
 * @access  Private (requires authentication)
 */
router.get('/stats/rate-limit', authenticateToken, newsController.getRateLimitStats);

/**
 * @route   POST /api/news/cache/clear
 * @desc    Clear news cache (admin only)
 * @access  Private (requires admin authentication)
 * @note    Configure ADMIN_EMAILS environment variable for admin access
 */
router.post('/cache/clear', authenticateToken, requireAdmin, newsController.clearNewsCache);

module.exports = router;
