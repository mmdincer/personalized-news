const express = require('express');
const router = express.Router();
const savedArticlesController = require('../controllers/savedArticlesController');
const { authenticateToken } = require('../middleware/auth');

/**
 * Saved Articles Routes
 * All routes require JWT authentication
 * Base path: /api/user/saved-articles
 */

/**
 * @route   POST /api/user/saved-articles
 * @desc    Save an article for later reading
 * @access  Private (requires JWT token)
 * @body    {string} article_url - Article URL (required)
 * @body    {string} article_title - Article title (required)
 * @body    {string} [article_image_url] - Article image URL (optional)
 * @returns {Object} Saved article data
 * @example
 *   POST /api/user/saved-articles
 *   Headers: { Authorization: "Bearer <token>" }
 *   Body: {
 *     article_url: "https://www.theguardian.com/...",
 *     article_title: "Article Title",
 *     article_image_url: "https://..."
 *   }
 *   Response: {
 *     success: true,
 *     data: {
 *       id: "uuid",
 *       article_url: "https://...",
 *       article_title: "Article Title",
 *       article_image_url: "https://...",
 *       saved_at: "2026-01-06T..."
 *     }
 *   }
 */
router.post('/', authenticateToken, savedArticlesController.saveArticle);

/**
 * @route   GET /api/user/saved-articles
 * @desc    Get all saved articles for the authenticated user
 * @access  Private (requires JWT token)
 * @returns {Array<Object>} Array of saved articles (ordered by saved_at DESC)
 * @example
 *   GET /api/user/saved-articles
 *   Headers: { Authorization: "Bearer <token>" }
 *   Response: {
 *     success: true,
 *     data: [
 *       {
 *         id: "uuid",
 *         article_url: "https://...",
 *         article_title: "Article Title",
 *         article_image_url: "https://...",
 *         saved_at: "2026-01-06T..."
 *       }
 *     ]
 *   }
 */
router.get('/', authenticateToken, savedArticlesController.getSavedArticles);

/**
 * @route   DELETE /api/user/saved-articles/:id
 * @desc    Delete a saved article
 * @access  Private (requires JWT token)
 * @param   {string} id - Saved article ID (UUID)
 * @returns {void} 204 No Content on success
 * @example
 *   DELETE /api/user/saved-articles/123e4567-e89b-12d3-a456-426614174000
 *   Headers: { Authorization: "Bearer <token>" }
 *   Response: 204 No Content
 */
router.delete('/:id', authenticateToken, savedArticlesController.deleteSavedArticle);

module.exports = router;


