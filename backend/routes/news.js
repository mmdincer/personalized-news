/**
 * News Routes
 *
 * Defines all news-related API endpoints
 */

const express = require('express');
const { query, param } = require('express-validator');
const newsController = require('../controllers/newsController');
const { authenticateToken, optionalAuth, requireAdmin } = require('../middleware/auth');
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

const dateFilterValidation = [
  query('from')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('From date must be in YYYY-MM-DD format'),
  query('to')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('To date must be in YYYY-MM-DD format'),
];

const searchValidation = [
  query('q')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters')
    .escape(),
  ...paginationValidation,
];

// ===========================
// Public Routes
// ===========================

/**
 * @route   GET /api/news/search
 * @desc    Search news articles
 * @access  Public
 * @query   q - Search query (required, min 2 characters)
 * @query   page (optional) - Page number (default: 1)
 * @query   limit (optional) - Results per page (default: 20, max: 50)
 */
router.get(
  '/search',
  newsLimiter,
  searchValidation,
  newsController.searchNews
);

/**
 * @route   GET /api/news/article/:id
 * @desc    Get single article by ID or URL (with full content)
 * @access  Public (but UUIDs require authentication for saved articles)
 * @params  id - Article ID (e.g., "technology/2024/jan/05/article-id"), full URL, or saved article UUID
 * @note    UUID format requests require authentication (saved articles)
 */
router.get(
  '/article/:id(*)',
  newsLimiter,
  optionalAuth, // Optional auth - controller checks if UUID requires auth
  newsController.getArticleById
);

/**
 * @route   GET /api/news/:category
 * @desc    Get news by category
 * @access  Public
 * @params  category - One of: business, technology, science, sport, culture, news, world, politics, environment, society, lifeandstyle, food, travel, fashion, books, music, film, games, education, media
 * @query   page (optional) - Page number (default: 1)
 * @query   limit (optional) - Results per page (default: 20, max: 100)
 */
router.get(
  '/:category',
  newsLimiter,
  [...categoryValidation, ...paginationValidation, ...dateFilterValidation],
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
  [...paginationValidation, ...dateFilterValidation],
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
