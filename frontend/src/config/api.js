/**
 * API Configuration
 * 
 * Centralized Axios instance with interceptors for:
 * - Base URL configuration
 * - Automatic token injection
 * - Request/response interceptors
 * - Error handling
 */

import axios from 'axios';

// Base URL from environment variable (defaults to localhost:3000/api)
// Validate environment variables in development
if (import.meta.env.MODE === 'development' && !import.meta.env.VITE_API_BASE_URL) {
  console.warn('⚠️  VITE_API_BASE_URL is not set. Using default: http://localhost:3000/api');
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * Create Axios instance with base configuration
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

/**
 * Request Interceptor
 * Automatically adds Authorization header with JWT token if available
 */
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');

    // Add token to Authorization header if available
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles common response patterns and errors
 */
apiClient.interceptors.response.use(
  (response) => {
    // Return response data directly (axios wraps it in data property)
    return response.data;
  },
  (error) => {
    // Handle response errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      // Handle 401 Unauthorized - token expired or invalid
      if (status === 401) {
        // Clear token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Only redirect if not already on login/register page
        if (!window.location.pathname.includes('/login') && 
            !window.location.pathname.includes('/register')) {
          // Use replace instead of href to avoid adding to history
          window.location.replace('/login');
        }
      }

      // Return error response data (standardized format from backend)
      return Promise.reject(data || error);
    } else if (error.request) {
      // Request was made but no response received (network error)
      return Promise.reject({
        success: false,
        error: {
          code: 'SYS_NETWORK_ERROR',
          message: 'Network error: Unable to reach server',
          timestamp: new Date().toISOString(),
        },
      });
    } else {
      // Something else happened
      return Promise.reject({
        success: false,
        error: {
          code: 'SYS_INTERNAL_ERROR',
          message: error.message || 'An unexpected error occurred',
          timestamp: new Date().toISOString(),
        },
      });
    }
  }
);

export default apiClient;

