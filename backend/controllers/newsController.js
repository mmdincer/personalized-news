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
const savedArticlesService = require('../services/savedArticlesService');

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
 * Checks saved articles first, then falls back to Guardian API
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
    // and: /api/news/article/{saved-article-uuid}
    const articleIdOrUrl = req.params.id || req.params['*'];

    if (!articleIdOrUrl) {
      const error = new Error('Article ID or URL is required');
      error.code = 'VAL_MISSING_FIELD';
      error.statusCode = 400;
      return next(error);
    }

    // Check if user is authenticated
    const userId = req.user?.id;

    // First, check if it's a saved article UUID (UUID format: 8-4-4-4-12 hex characters)
    // Check UUID format first, then verify if user is authenticated
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(articleIdOrUrl);
    
    if (isUUID) {
      // UUID format detected - must be authenticated to access saved articles
      if (!userId) {
        const error = new Error('Authentication required to access saved articles');
        error.code = 'AUTH_REQUIRED';
        error.statusCode = 401;
        return next(error);
      }

      const savedArticle = await savedArticlesService.getSavedArticleById(userId, articleIdOrUrl);
      if (savedArticle) {
        // Convert saved article to article format
        const article = {
          id: savedArticle.id,
          title: savedArticle.article_title,
          description: savedArticle.article_description,
          content: savedArticle.article_content,
          url: savedArticle.article_url,
          imageUrl: savedArticle.article_image_url,
          publishedAt: savedArticle.article_published_at || savedArticle.saved_at,
          source: {
            name: savedArticle.article_source_name || 'Saved Article',
          },
        };

        return res.json({
          success: true,
          data: article,
        });
      } else {
        // UUID format but not found in saved articles - return 404
        const error = new Error('Saved article not found');
        error.code = 'SAVED_ARTICLE_NOT_FOUND';
        error.statusCode = 404;
        return next(error);
      }
    }

    // If authenticated, also check by URL
    if (userId && articleIdOrUrl.startsWith('http')) {
      const savedArticle = await savedArticlesService.getSavedArticleByUrl(userId, articleIdOrUrl);
      if (savedArticle) {
        // Convert saved article to article format
        const article = {
          id: savedArticle.id,
          title: savedArticle.article_title,
          description: savedArticle.article_description,
          content: savedArticle.article_content,
          url: savedArticle.article_url,
          imageUrl: savedArticle.article_image_url,
          publishedAt: savedArticle.article_published_at || savedArticle.saved_at,
          source: {
            name: savedArticle.article_source_name || 'Saved Article',
          },
        };

        return res.json({
          success: true,
          data: article,
        });
      }
    }

    // Fall back to Guardian API
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
 * Search news articles
 * GET /api/news/search
 *
 * Searches news articles using The Guardian API search endpoint
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
const searchNews = async (req, res, next) => {
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
    const query = req.query.q;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // Validate query parameter
    if (!query) {
      const error = new Error('Search query (q) is required');
      error.code = 'VAL_MISSING_FIELD';
      error.statusCode = 400;
      return next(error);
    }

    // Call service layer
    const news = await newsService.searchNews(query, page, limit);

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
  searchNews,
  clearNewsCache,
};
