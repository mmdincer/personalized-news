/**
 * Profile Controller
 * 
 * Handles HTTP requests for user profile operations:
 * - Password updates
 * - Profile information retrieval
 */

const profileService = require('../services/profileService');

/**
 * Update user password
 * PUT /api/user/password
 * @requires Authentication (JWT token in Authorization header)
 * @body {string} currentPassword - Current password
 * @body {string} newPassword - New password
 */
const updatePassword = async (req, res, next) => {
  try {
    // Get user ID from JWT token (set by auth middleware)
    const userId = req.user.id;

    // Get passwords from request body
    const { currentPassword, newPassword } = req.body;

    // Validate required fields
    if (!currentPassword) {
      const error = new Error('Current password is required');
      error.statusCode = 400;
      error.errorCode = 'VAL_MISSING_FIELD';
      return next(error);
    }

    if (!newPassword) {
      const error = new Error('New password is required');
      error.statusCode = 400;
      error.errorCode = 'VAL_MISSING_FIELD';
      return next(error);
    }

    // Update password via service
    await profileService.updatePassword(userId, currentPassword, newPassword);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    // Map service errors to error codes
    let errorCode = 'SYS_INTERNAL_ERROR';
    let statusCode = 500;

    if (error.code === 'VAL_WEAK_PASSWORD') {
      errorCode = 'VAL_WEAK_PASSWORD';
      statusCode = 400;
    } else if (error.code === 'VAL_SAME_PASSWORD') {
      errorCode = 'VAL_SAME_PASSWORD';
      statusCode = 400;
    } else if (error.code === 'AUTH_INVALID_PASSWORD') {
      errorCode = 'AUTH_INVALID_PASSWORD';
      statusCode = 401;
    } else if (error.code === 'USER_NOT_FOUND') {
      errorCode = 'USER_NOT_FOUND';
      statusCode = 404;
    }

    error.errorCode = errorCode;
    error.statusCode = statusCode;

    return next(error);
  }
};

/**
 * Get user profile information
 * GET /api/user/profile
 * @requires Authentication (JWT token in Authorization header)
 */
const getProfile = async (req, res, next) => {
  try {
    // Get user ID from JWT token (set by auth middleware)
    const userId = req.user.id;

    // Get profile via service
    const profile = await profileService.getProfile(userId);

    // Return success response
    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    // Map service errors to error codes
    let errorCode = 'SYS_INTERNAL_ERROR';
    let statusCode = 500;

    if (error.code === 'USER_NOT_FOUND') {
      errorCode = 'USER_NOT_FOUND';
      statusCode = 404;
    }

    error.errorCode = errorCode;
    error.statusCode = statusCode;

    return next(error);
  }
};

module.exports = {
  updatePassword,
  getProfile,
};



