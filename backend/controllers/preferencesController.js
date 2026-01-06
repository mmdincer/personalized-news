const preferencesService = require('../services/preferencesService');
const { clearPreferencesCache } = require('../middleware/auth');

/**
 * Get user preferences
 * GET /api/user/preferences
 * @requires Authentication (JWT token in Authorization header)
 */
const getPreferences = async (req, res, next) => {
  try {
    // Get user ID from JWT token (set by auth middleware)
    const userId = req.user.id;

    // Fetch preferences from service
    const preferences = await preferencesService.getUserPreferences(userId);

    // Return success response
    res.status(200).json({
      success: true,
      data: {
        categories: preferences.categories,
      },
    });
  } catch (error) {
    // Map service errors to error codes
    let errorCode = 'SYS_INTERNAL_ERROR';
    let statusCode = 500;
    let message = error.message || 'Failed to fetch user preferences';

    if (error.message.includes('User ID is required')) {
      errorCode = 'VAL_MISSING_FIELD';
      statusCode = 400;
      message = 'User ID is required';
    }

    // Pass error to error handling middleware
    const customError = new Error(message);
    customError.statusCode = statusCode;
    customError.errorCode = errorCode;
    return next(customError);
  }
};

/**
 * Update user preferences
 * PUT /api/user/preferences
 * @requires Authentication (JWT token in Authorization header)
 * @body {Object} preferences - Preferences to update
 * @body {Array<string>} [preferences.categories] - News categories
 */
const updatePreferences = async (req, res, next) => {
  try {
    // Get user ID from JWT token (set by auth middleware)
    const userId = req.user.id;

    // Get preferences from request body
    const { categories } = req.body;

    // Validate that at least one field is provided
    if (categories === undefined) {
      const error = new Error('Categories field must be provided');
      error.statusCode = 400;
      error.errorCode = 'VAL_MISSING_FIELD';
      return next(error);
    }

    // Build preferences object
    const preferences = {
      categories,
    };

    // Update preferences via service
    const updatedPreferences = await preferencesService.updateUserPreferences(
      userId,
      preferences
    );

    // Clear preferences cache for this user (cache invalidation)
    clearPreferencesCache(userId);

    // Return success response
    res.status(200).json({
      success: true,
      data: {
        categories: updatedPreferences.categories,
      },
    });
  } catch (error) {
    // Map service errors to error codes
    let errorCode = 'SYS_INTERNAL_ERROR';
    let statusCode = 500;
    let message = error.message || 'Failed to update user preferences';

    // Validation errors
    if (error.message.includes('Categories must be an array')) {
      errorCode = 'VAL_INVALID_FORMAT';
      statusCode = 400;
      message = error.message;
    } else if (error.message.includes('At least one category must be selected')) {
      errorCode = 'VAL_MISSING_FIELD';
      statusCode = 400;
      message = error.message;
    } else if (error.message.includes('Invalid categories')) {
      errorCode = 'PREF_INVALID_CATEGORY';
      statusCode = 400;
      message = error.message;
    } else if (error.message.includes('User ID is required')) {
      errorCode = 'VAL_MISSING_FIELD';
      statusCode = 400;
      message = 'User ID is required';
    } else if (error.message.includes('Preferences object is required')) {
      errorCode = 'VAL_MISSING_FIELD';
      statusCode = 400;
      message = 'Preferences object is required';
    } else if (error.message.includes('Failed to update user preferences')) {
      errorCode = 'PREF_UPDATE_FAILED';
      statusCode = 500;
      message = error.message;
    }

    // Pass error to error handling middleware
    const customError = new Error(message);
    customError.statusCode = statusCode;
    customError.errorCode = errorCode;
    return next(customError);
  }
};

module.exports = {
  getPreferences,
  updatePreferences,
};
