/**
 * Profile Routes
 * 
 * User profile management endpoints:
 * - Password updates
 * - Profile information retrieval
 * All routes require JWT authentication
 * Base path: /api/user/profile
 */

const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticateToken } = require('../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');

/**
 * @route   GET /api/user/profile
 * @desc    Get user profile information
 * @access  Private (requires JWT token)
 * @returns {Object} User profile data
 * @example
 *   GET /api/user/profile
 *   Headers: { Authorization: "Bearer <token>" }
 *   Response: {
 *     success: true,
 *     data: {
 *       id: "uuid",
 *       email: "user@example.com",
 *       name: "User Name",
 *       createdAt: "2024-01-01T00:00:00Z",
 *       updatedAt: "2024-01-01T00:00:00Z"
 *     }
 *   }
 */
router.get('/', authenticateToken, profileController.getProfile);

/**
 * @route   PUT /api/user/password
 * @desc    Update user password
 * @access  Private (requires JWT token)
 * @body    {string} currentPassword - Current password (required)
 * @body    {string} newPassword - New password (required)
 * @returns {Object} Success message
 * @example
 *   PUT /api/user/password
 *   Headers: { Authorization: "Bearer <token>" }
 *   Body: {
 *     currentPassword: "OldPass123!",
 *     newPassword: "NewPass123!"
 *   }
 *   Response: {
 *     success: true,
 *     message: "Password updated successfully"
 *   }
 */
router.put(
  '/password',
  authenticateToken,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required')
      .isString()
      .withMessage('Current password must be a string'),
    body('newPassword')
      .notEmpty()
      .withMessage('New password is required')
      .isString()
      .withMessage('New password must be a string')
      .isLength({ min: 8, max: 100 })
      .withMessage('New password must be between 8 and 100 characters'),
  ],
  validate,
  profileController.updatePassword
);

module.exports = router;

