/**
 * Saved Articles Service
 * 
 * Handles all saved articles-related API calls:
 * - Save an article
 * - Get all saved articles
 * - Delete a saved article
 * - Check if article is saved
 * 
 * Includes caching to avoid multiple API calls
 */

import apiClient from '../config/api.js';

// In-memory cache for saved articles
let savedArticlesCache = null;
let cacheTimestamp = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Clear the saved articles cache
 * Call this after save/delete operations
 */
export const clearSavedArticlesCache = () => {
  savedArticlesCache = null;
  cacheTimestamp = null;
};

/**
 * Check if cache is valid
 */
const isCacheValid = () => {
  if (!savedArticlesCache || !cacheTimestamp) {
    return false;
  }
  return Date.now() - cacheTimestamp < CACHE_TTL_MS;
};

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

  // Clear cache after saving
  clearSavedArticlesCache();

  return response;
};

/**
 * Get all saved articles for the authenticated user
 * Requires authentication
 * Uses cache to avoid multiple API calls
 * @param {boolean} forceRefresh - Force refresh cache (default: false)
 * @returns {Promise<Array<Object>>} Array of saved articles
 */
export const getSavedArticles = async (forceRefresh = false) => {
  // Return cached data if valid and not forcing refresh
  if (!forceRefresh && isCacheValid()) {
    return {
      success: true,
      data: savedArticlesCache,
    };
  }

  try {
    const response = await apiClient.get('/user/saved-articles');
    
    // Update cache
    if (response.success && response.data) {
      savedArticlesCache = response.data;
      cacheTimestamp = Date.now();
    }
    
    return response;
  } catch (error) {
    // If error, clear cache
    clearSavedArticlesCache();
    throw error;
  }
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

  // Clear cache after deleting
  clearSavedArticlesCache();
};

/**
 * Check if an article is saved by the authenticated user
 * Uses cache to avoid multiple API calls
 * @param {string} articleUrl - Article URL to check
 * @param {Map<string, Object>} savedArticlesMap - Optional pre-loaded map of saved articles (for performance)
 * @returns {Promise<Object|null>} Saved article data if found, null otherwise
 */
export const isArticleSaved = async (articleUrl, savedArticlesMap = null) => {
  if (!articleUrl) {
    return null;
  }

  try {
    // If map is provided, use it directly (fastest)
    if (savedArticlesMap && savedArticlesMap instanceof Map) {
      return savedArticlesMap.get(articleUrl) || null;
    }

    // Otherwise, use cache or fetch
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
 * @param {Map<string, Object>} savedArticlesMap - Optional pre-loaded map of saved articles (for performance)
 * @returns {Promise<void>}
 */
export const deleteSavedArticleByUrl = async (articleUrl, savedArticlesMap = null) => {
  if (!articleUrl) {
    throw new Error('Article URL is required');
  }

  // Find the saved article by URL
  const savedArticle = await isArticleSaved(articleUrl, savedArticlesMap);
  
  if (!savedArticle || !savedArticle.id) {
    throw new Error('Saved article not found');
  }

  // Delete by ID
  await deleteSavedArticle(savedArticle.id);
};

