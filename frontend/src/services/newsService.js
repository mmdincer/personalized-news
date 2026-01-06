/**
 * News Service
 * 
 * Handles all news-related API calls:
 * - Get personalized news (authenticated)
 * - Get news by category (public)
 */

import apiClient from '../config/api.js';

/**
 * Get personalized news based on user preferences
 * Requires authentication
 * @param {Object} params - Query parameters
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=20] - Results per page (max 100)
 * @returns {Promise<Object>} News response with articles
 */
export const getNews = async ({ page = 1, limit = 20 } = {}) => {
  const response = await apiClient.get('/news', {
    params: {
      page,
      limit,
    },
  });

  return response;
};

/**
 * Get news by category (public endpoint)
 * @param {Object} params - Query parameters
 * @param {string} params.category - News category (business, entertainment, general, health, science, sports, technology)
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=20] - Results per page (max 100)
 * @returns {Promise<Object>} News response with articles
 */
export const getNewsByCategory = async ({ category, page = 1, limit = 20 }) => {
  if (!category) {
    throw new Error('Category is required');
  }

  const response = await apiClient.get(`/news/${category}`, {
    params: {
      page,
      limit,
    },
  });

  return response;
};

