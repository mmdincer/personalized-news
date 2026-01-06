const savedArticlesService = require('../services/savedArticlesService');

/**
 * Save an article
 * POST /api/user/saved-articles
 * @requires Authentication (JWT token in Authorization header)
 */
const saveArticle = async (req, res, next) => {
  try {
    // Get user ID from JWT token (set by auth middleware)
    const userId = req.user.id;

    // Get article data from request body
    const { article_url, article_title, article_image_url } = req.body;

    // Validate required fields
    if (!article_url) {
      const error = new Error('Article URL is required');
      error.statusCode = 400;
      error.errorCode = 'VAL_MISSING_FIELD';
      return next(error);
    }

    if (!article_title) {
      const error = new Error('Article title is required');
      error.statusCode = 400;
      error.errorCode = 'VAL_MISSING_FIELD';
      return next(error);
    }

    // Save article via service
    const savedArticle = await savedArticlesService.saveArticle(userId, {
      article_url,
      article_title,
      article_image_url,
    });

    // Return success response
    res.status(201).json({
      success: true,
      data: savedArticle,
    });
  } catch (error) {
    // Map service errors to error codes
    let errorCode = 'SYS_INTERNAL_ERROR';
    let statusCode = 500;
    let message = error.message || 'Failed to save article';

    // Validation errors
    if (error.message.includes('User ID is required')) {
      errorCode = 'VAL_MISSING_FIELD';
      statusCode = 400;
    } else if (error.message.includes('Article data is required')) {
      errorCode = 'VAL_MISSING_FIELD';
      statusCode = 400;
    } else if (error.message.includes('Article URL is required')) {
      errorCode = 'VAL_MISSING_FIELD';
      statusCode = 400;
    } else if (error.message.includes('Article title is required')) {
      errorCode = 'VAL_MISSING_FIELD';
      statusCode = 400;
    } else if (error.message.includes('must be 500 characters or less')) {
      errorCode = 'VAL_INVALID_FORMAT';
      statusCode = 400;
    } else if (error.message.includes('already saved')) {
      errorCode = 'SAVED_ARTICLE_DUPLICATE';
      statusCode = 409; // Conflict
    } else if (error.message.includes('Failed to save article')) {
      errorCode = 'SAVED_ARTICLE_SAVE_FAILED';
      statusCode = 500;
    }

    // Pass error to error handling middleware
    const customError = new Error(message);
    customError.statusCode = statusCode;
    customError.errorCode = errorCode;
    return next(customError);
  }
};

/**
 * Get all saved articles for the authenticated user
 * GET /api/user/saved-articles
 * @requires Authentication (JWT token in Authorization header)
 */
const getSavedArticles = async (req, res, next) => {
  try {
    // Get user ID from JWT token (set by auth middleware)
    const userId = req.user.id;

    // Fetch saved articles from service
    const savedArticles = await savedArticlesService.getSavedArticles(userId);

    // Return success response
    res.status(200).json({
      success: true,
      data: savedArticles,
    });
  } catch (error) {
    // Map service errors to error codes
    let errorCode = 'SYS_INTERNAL_ERROR';
    let statusCode = 500;
    let message = error.message || 'Failed to fetch saved articles';

    if (error.message.includes('User ID is required')) {
      errorCode = 'VAL_MISSING_FIELD';
      statusCode = 400;
    } else if (error.message.includes('Failed to fetch saved articles')) {
      errorCode = 'SAVED_ARTICLE_FETCH_FAILED';
      statusCode = 500;
    }

    // Pass error to error handling middleware
    const customError = new Error(message);
    customError.statusCode = statusCode;
    customError.errorCode = errorCode;
    return next(customError);
  }
};

/**
 * Delete a saved article
 * DELETE /api/user/saved-articles/:id
 * @requires Authentication (JWT token in Authorization header)
 */
const deleteSavedArticle = async (req, res, next) => {
  try {
    // Get user ID from JWT token (set by auth middleware)
    const userId = req.user.id;

    // Get article ID from URL parameters
    const articleId = req.params.id;

    // Validate article ID
    if (!articleId) {
      const error = new Error('Article ID is required');
      error.statusCode = 400;
      error.errorCode = 'VAL_MISSING_FIELD';
      return next(error);
    }

    // Delete article via service
    await savedArticlesService.deleteSavedArticle(userId, articleId);

    // Return success response (204 No Content)
    res.status(204).send();
  } catch (error) {
    // Map service errors to error codes
    let errorCode = 'SYS_INTERNAL_ERROR';
    let statusCode = 500;
    let message = error.message || 'Failed to delete saved article';

    if (error.message.includes('User ID is required')) {
      errorCode = 'VAL_MISSING_FIELD';
      statusCode = 400;
    } else if (error.message.includes('Article ID is required')) {
      errorCode = 'VAL_MISSING_FIELD';
      statusCode = 400;
    } else if (error.message.includes('not found') || error.message.includes('access denied')) {
      errorCode = 'SAVED_ARTICLE_NOT_FOUND';
      statusCode = 404;
    } else if (error.message.includes('Failed to delete saved article')) {
      errorCode = 'SAVED_ARTICLE_DELETE_FAILED';
      statusCode = 500;
    }

    // Pass error to error handling middleware
    const customError = new Error(message);
    customError.statusCode = statusCode;
    customError.errorCode = errorCode;
    return next(customError);
  }
};

module.exports = {
  saveArticle,
  getSavedArticles,
  deleteSavedArticle,
};


