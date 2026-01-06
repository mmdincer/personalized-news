const express = require('express');
const router = express.Router();
const preferencesController = require('../controllers/preferencesController');
const { authenticateToken } = require('../middleware/auth');

/**
 * User Preferences Routes
 * All routes require JWT authentication
 * Base path: /api/user/preferences
 */

/**
 * @route   GET /api/user/preferences
 * @desc    Get user preferences (categories + country)
 * @access  Private (requires JWT token)
 * @returns {Object} User preferences
 * @example
 *   GET /api/user/preferences
 *   Headers: { Authorization: "Bearer <token>" }
 *   Response: {
 *     success: true,
 *     data: {
 *       categories: ["general", "technology"],
 *       country: "tr"
 *     }
 *   }
 */
router.get('/', authenticateToken, preferencesController.getPreferences);

/**
 * @route   PUT /api/user/preferences
 * @desc    Update user preferences (categories and/or country)
 * @access  Private (requires JWT token)
 * @body    {Array<string>} [categories] - News categories (optional)
 * @body    {string} [country] - Country code: tr, us, de, fr, es (optional)
 * @returns {Object} Updated preferences
 * @example
 *   PUT /api/user/preferences
 *   Headers: { Authorization: "Bearer <token>" }
 *   Body: {
 *     categories: ["business", "technology", "science"],
 *     country: "us"
 *   }
 *   Response: {
 *     success: true,
 *     data: {
 *       categories: ["business", "technology", "science"],
 *       country: "us"
 *     }
 *   }
 */
router.put('/', authenticateToken, preferencesController.updatePreferences);

module.exports = router;
