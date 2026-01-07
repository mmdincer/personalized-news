/**
 * Authentication Service
 * 
 * Handles all authentication-related API calls:
 * - User registration
 * - User login
 * - User logout (local)
 */

import apiClient from '../config/api.js';

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.email - User email
 * @param {string} userData.name - User full name
 * @param {string} userData.password - User password
 * @returns {Promise<Object>} Response with user data and token
 */
export const register = async ({ email, name, password }) => {
  const response = await apiClient.post('/auth/register', {
    email,
    name,
    password,
  });

  // Store token and user data in localStorage
  if (response.success && response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }

  return response;
};

/**
 * Login user
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise<Object>} Response with user data and token
 */
export const login = async ({ email, password }) => {
  const response = await apiClient.post('/auth/login', {
    email,
    password,
  });

  // Store token and user data in localStorage
  if (response.success && response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }

  return response;
};

/**
 * Logout user (clears local storage)
 * Note: Backend doesn't have a logout endpoint since JWT is stateless
 * This function clears the token and user data from localStorage
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Get current user from localStorage
 * @returns {Object|null} User object or null if not logged in
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if token exists in localStorage
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};




