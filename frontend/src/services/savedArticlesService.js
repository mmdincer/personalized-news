/**
 * Saved Articles Service
 * 
 * Handles all saved articles-related API calls:
 * - Save an article
 * - Get all saved articles
 * - Delete a saved article
 * - Check if article is saved
 */

import apiClient from '../config/api.js';

/**
 * Save an article
 * Requires authentication
 * @param {Object} articleData - Article data to save
 * @param {string} articleData.article_url - Article URL (required)
 * @param {string} articleData.article_title - Article title (required)
 * @param {string} [articleData.article_image_url] - Article image URL (optional)
 * @returns {Promise<Object>} Saved article data
 */
export const saveArticle = async ({ article_url, article_title, article_image_url }) => {
  if (!article_url || !article_title) {
    throw new Error('Article URL and title are required');
  }

  const response = await apiClient.post('/user/saved-articles', {
    article_url,
    article_title,
    article_image_url,
  });

  return response;
};

/**
 * Get all saved articles for the authenticated user
 * Requires authentication
 * @returns {Promise<Array<Object>>} Array of saved articles
 */
export const getSavedArticles = async () => {
  const response = await apiClient.get('/user/saved-articles');
  return response;
};

/**
 * Delete a saved article
 * Requires authentication
 * @param {string} articleId - Saved article ID (UUID)
 * @returns {Promise<void>}
 */
export const deleteSavedArticle = async (articleId) => {
  if (!articleId) {
    throw new Error('Article ID is required');
  }

  await apiClient.delete(`/user/saved-articles/${articleId}`);
};

