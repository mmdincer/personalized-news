/**
 * Preferences Service
 * 
 * Handles all user preferences-related API calls:
 * - Get user preferences
 * - Update user preferences
 */

import apiClient from '../config/api.js';

/**
 * Get user preferences
 * Requires authentication
 * @returns {Promise<Object>} User preferences (categories)
 */
export const getPreferences = async () => {
  const response = await apiClient.get('/user/preferences');
  return response;
};

/**
 * Update user preferences
 * Requires authentication
 * @param {Object} preferences - Preferences to update
 * @param {Array<string>} preferences.categories - News categories array
 * @returns {Promise<Object>} Updated preferences
 */
export const updatePreferences = async ({ categories }) => {
  if (!categories || !Array.isArray(categories)) {
    throw new Error('Categories must be an array');
  }

  const response = await apiClient.put('/user/preferences', {
    categories,
  });

  return response;
};


