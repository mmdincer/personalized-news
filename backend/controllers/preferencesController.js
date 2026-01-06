const preferencesService = require('../services/preferencesService');

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
        country: preferences.country,
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
 * @body {string} [preferences.country] - Country code (tr, us, de, fr, es)
 */
const updatePreferences = async (req, res, next) => {
  try {
    // Get user ID from JWT token (set by auth middleware)
    const userId = req.user.id;

    // Get preferences from request body
    const { categories, country } = req.body;

    // Validate that at least one field is provided
    if (categories === undefined && country === undefined) {
      const error = new Error(
        'At least one field (categories or country) must be provided'
      );
      error.statusCode = 400;
      error.errorCode = 'VAL_MISSING_FIELD';
      return next(error);
    }

    // Build preferences object (only include provided fields)
    const preferences = {};
    if (categories !== undefined) {
      preferences.categories = categories;
    }
    if (country !== undefined) {
      preferences.country = country;
    }

    // Update preferences via service
    const updatedPreferences = await preferencesService.updateUserPreferences(
      userId,
      preferences
    );

    // Return success response
    res.status(200).json({
      success: true,
      data: {
        categories: updatedPreferences.categories,
        country: updatedPreferences.country,
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
    } else if (error.message.includes('Invalid country code')) {
      errorCode = 'PREF_INVALID_COUNTRY';
      statusCode = 400;
      message = error.message;
    } else if (error.message.includes('Country must be a string')) {
      errorCode = 'VAL_INVALID_FORMAT';
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
