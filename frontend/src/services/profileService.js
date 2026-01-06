/**
 * Profile Service
 * 
 * Handles all user profile-related API calls:
 * - Get user profile
 * - Update password
 */

import apiClient from '../config/api.js';

/**
 * Get user profile information
 * Requires authentication
 * @returns {Promise<Object>} User profile data
 */
export const getProfile = async () => {
  const response = await apiClient.get('/user/profile');
  return response;
};

/**
 * Update user password
 * Requires authentication
 * @param {Object} passwordData - Password update data
 * @param {string} passwordData.currentPassword - Current password
 * @param {string} passwordData.newPassword - New password
 * @returns {Promise<Object>} Success response
 */
export const updatePassword = async ({ currentPassword, newPassword }) => {
  const response = await apiClient.put('/user/profile/password', {
    currentPassword,
    newPassword,
  });
  return response;
};

