/**
 * News Controller
 *
 * SRP: Handles HTTP requests/responses for news endpoints
 * - NO business logic (service layer handles that)
 * - Request validation (express-validator)
 * - Response formatting
 * - Error delegation to error handler middleware
 */

const { validationResult } = require('express-validator');
const newsService = require('../services/newsService');

/**
 * Get news by category
 * GET /api/news/:category
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
const getNewsByCategory = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed');
      error.code = 'VAL_INVALID_FORMAT';
      error.statusCode = 400;
      error.details = errors.array();
      return next(error);
    }

    // Extract parameters
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // Call service layer
    const news = await newsService.fetchNewsByCategory(category, page, limit);

    // Send success response
    res.json({
      success: true,
      data: news,
    });
  } catch (error) {
    // Pass error to error handler middleware
    next(error);
  }
};

/**
 * Get personalized news based on user preferences
 * GET /api/news
 *
 * Requires authentication - fetches news from user's preferred categories
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
const getPersonalizedNews = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed');
      error.code = 'VAL_INVALID_FORMAT';
      error.statusCode = 400;
      error.details = errors.array();
      return next(error);
    }

    // Extract parameters
    // Note: req.user is guaranteed to exist here because authenticateToken middleware runs before this controller
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // Get user preferences from request (attached by auth middleware)
    const { categories } = req.user;

    // Validate user has preferences
    if (!categories || categories.length === 0) {
      const error = new Error('User has no category preferences set');
      error.code = 'PREF_NOT_FOUND';
      error.statusCode = 404;
      return next(error);
    }

    // Call service layer
    const news = await newsService.fetchNewsByPreferences(
      categories,
      page,
      limit
    );

    // Send success response
    res.json({
      success: true,
      data: news,
    });
  } catch (error) {
    // Pass error to error handler middleware
    next(error);
  }
};

/**
 * Get rate limit statistics
 * GET /api/news/stats/rate-limit
 *
 * Returns current rate limit usage for monitoring
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
const getRateLimitStats = async (req, res, next) => {
  try {
    const stats = newsService.getRateLimitStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single article by ID or URL
 * GET /api/news/article/:id
 *
 * Fetches full article content including bodyText
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
const getArticleById = async (req, res, next) => {
  try {
    // Extract article ID or URL from params
    // Support both: /api/news/article/technology/2024/jan/05/article-id
    // and: /api/news/article/https://www.theguardian.com/...
    const articleIdOrUrl = req.params.id || req.params['*'];

    if (!articleIdOrUrl) {
      const error = new Error('Article ID or URL is required');
      error.code = 'VAL_MISSING_FIELD';
      error.statusCode = 400;
      return next(error);
    }

    // Call service layer
    const article = await newsService.fetchArticleById(articleIdOrUrl);

    // Send success response
    res.json({
      success: true,
      data: article,
    });
  } catch (error) {
    // Pass error to error handler middleware
    next(error);
  }
};

/**
 * Clear news cache (admin only)
 * POST /api/news/cache/clear
 *
 * Manual cache clearing for testing or maintenance
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
const clearNewsCache = async (req, res, next) => {
  try {
    newsService.clearCache();

    res.json({
      success: true,
      message: 'News cache cleared successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNewsByCategory,
  getPersonalizedNews,
  getArticleById,
  getRateLimitStats,
  clearNewsCache,
};
