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

/**
 * Check if an article is saved by the authenticated user
 * Requires authentication
 * @param {string} articleUrl - Article URL to check
 * @returns {Promise<Object|null>} Saved article data if found, null otherwise
 */
export const isArticleSaved = async (articleUrl) => {
  if (!articleUrl) {
    return null;
  }

  try {
    // Get all saved articles and check if URL matches
    const response = await getSavedArticles();
    
    if (response.success && response.data) {
      const savedArticle = response.data.find(
        (item) => item.article_url === articleUrl
      );
      return savedArticle || null;
    }
    
    return null;
  } catch (error) {
    // If error (e.g., not authenticated), return null
    return null;
  }
};

/**
 * Delete a saved article by URL (convenience function)
 * Requires authentication
 * @param {string} articleUrl - Article URL to delete
 * @returns {Promise<void>}
 */
export const deleteSavedArticleByUrl = async (articleUrl) => {
  if (!articleUrl) {
    throw new Error('Article URL is required');
  }

  // Find the saved article by URL
  const savedArticle = await isArticleSaved(articleUrl);
  
  if (!savedArticle || !savedArticle.id) {
    throw new Error('Saved article not found');
  }

  // Delete by ID
  await deleteSavedArticle(savedArticle.id);
};

