/**
 * News Service
 * 
 * Handles all news-related API calls:
 * - Get personalized news (authenticated)
 * - Get news by category (public)
 * 
 * Includes caching to reduce API calls and prevent rate limiting
 */

import apiClient from '../config/api.js';

// In-memory cache for news
const newsCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Generate cache key for news requests
 * @param {string} endpoint - API endpoint (e.g., '/news' or '/news/technology')
 * @param {Object} params - Query parameters
 * @returns {string} Cache key
 */
const getCacheKey = (endpoint, params = {}) => {
  const paramsStr = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return `${endpoint}?${paramsStr}`;
};

/**
 * Check if cache entry is valid
 * @param {Object} cached - Cached entry with timestamp
 * @returns {boolean} True if cache is valid
 */
const isCacheValid = (cached) => {
  if (!cached || !cached.timestamp) {
    return false;
  }
  return Date.now() - cached.timestamp < CACHE_TTL_MS;
};

/**
 * Search news articles
 * GET /api/news/search
 * @param {Object} params - Query parameters
 * @param {string} params.q - Search query (required)
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=20] - Results per page (max 50)
 * @param {string} [params.from] - Start date filter (YYYY-MM-DD format)
 * @param {string} [params.to] - End date filter (YYYY-MM-DD format)
 * @param {string} [params.sort] - Sort option (newest, oldest, relevance)
 * @param {boolean} [params.forceRefresh=false] - Force refresh cache
 * @returns {Promise<Object>} News response with articles
 */
export const searchNews = async ({ q, page = 1, limit = 20, from = null, to = null, sort = 'relevance', forceRefresh = false } = {}) => {
  if (!q || typeof q !== 'string' || q.trim().length === 0) {
    throw new Error('Search query is required');
  }

  if (q.trim().length < 2) {
    throw new Error('Search query must be at least 2 characters');
  }

  const endpoint = '/news/search';
  const params = { q: q.trim(), page, limit };
  if (from) params.from = from;
  if (to) params.to = to;
  if (sort) params.sort = sort;
  const cacheKey = getCacheKey(endpoint, params);

  // Check cache first
  if (!forceRefresh) {
    const cached = newsCache.get(cacheKey);
    if (cached && isCacheValid(cached)) {
      return cached.data;
    }
  }

  try {
    const response = await apiClient.get(endpoint, { params });

    // Cache response
    newsCache.set(cacheKey, {
      data: response,
      timestamp: Date.now(),
    });

    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Clear news cache
 * Useful for testing or manual cache invalidation
 */
export const clearNewsCache = () => {
  newsCache.clear();
};

/**
 * Get personalized news based on user preferences
 * Requires authentication
 * Uses cache to reduce API calls (5 minutes TTL)
 * @param {Object} params - Query parameters
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=20] - Results per page (max 100)
 * @param {string} [params.from] - Start date filter (YYYY-MM-DD format)
 * @param {string} [params.to] - End date filter (YYYY-MM-DD format)
 * @param {string} [params.sort] - Sort option (newest, oldest, relevance)
 * @param {boolean} [params.forceRefresh=false] - Force refresh cache
 * @returns {Promise<Object>} News response with articles
 */
export const getNews = async ({ 
  page = 1, 
  limit = 20, 
  from = null,
  to = null,
  sort = 'newest',
  forceRefresh = false 
} = {}) => {
  const endpoint = '/news';
  const params = { page, limit };
  
  // Add date filters if provided
  if (from) params.from = from;
  if (to) params.to = to;
  
  // Add sort if provided and not default
  if (sort && sort !== 'newest') {
    params.sort = sort;
  }
  
  const cacheKey = getCacheKey(endpoint, params);

  // Check cache first
  if (!forceRefresh) {
    const cached = newsCache.get(cacheKey);
    if (cached && isCacheValid(cached)) {
      return cached.data;
    }
  }

  // Fetch from API
  const response = await apiClient.get(endpoint, { params });

  // Update cache
  if (response.success) {
    newsCache.set(cacheKey, {
      data: response,
      timestamp: Date.now(),
    });
  }

  return response;
};

/**
 * Get news by category (public endpoint)
 * Uses cache to reduce API calls (5 minutes TTL)
 * @param {Object} params - Query parameters
 * @param {string} params.category - News category (business, entertainment, general, health, science, sports, technology)
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=20] - Results per page (max 100)
 * @param {string} [params.from] - Start date filter (YYYY-MM-DD format)
 * @param {string} [params.to] - End date filter (YYYY-MM-DD format)
 * @param {string} [params.sort] - Sort option (newest, oldest, relevance)
 * @param {boolean} [params.forceRefresh=false] - Force refresh cache
 * @returns {Promise<Object>} News response with articles
 */
export const getNewsByCategory = async ({ 
  category, 
  page = 1, 
  limit = 20,
  from = null,
  to = null,
  sort = 'newest',
  forceRefresh = false 
}) => {
  if (!category) {
    throw new Error('Category is required');
  }

  const endpoint = `/news/${category}`;
  const params = { page, limit };
  
  // Add date filters if provided
  if (from) params.from = from;
  if (to) params.to = to;
  
  // Add sort if provided and not default
  if (sort && sort !== 'newest') {
    params.sort = sort;
  }
  
  const cacheKey = getCacheKey(endpoint, params);

  // Check cache first
  if (!forceRefresh) {
    const cached = newsCache.get(cacheKey);
    if (cached && isCacheValid(cached)) {
      return cached.data;
    }
  }

  // Fetch from API
  const response = await apiClient.get(endpoint, { params });

  // Update cache
  if (response.success) {
    newsCache.set(cacheKey, {
      data: response,
      timestamp: Date.now(),
    });
  }

  return response;
};

/**
 * Get single article by ID or URL
 * @param {string} articleIdOrUrl - Article ID (e.g., "technology/2024/jan/05/article-id") or full URL
 * @returns {Promise<Object>} Article data with full content
 */
export const getArticleById = async (articleIdOrUrl) => {
  if (!articleIdOrUrl) {
    throw new Error('Article ID or URL is required');
  }

  // Encode article ID to handle special characters and slashes
  const encodedId = encodeURIComponent(articleIdOrUrl);
  // apiClient interceptor returns response.data
  // Backend returns { success: true, data: article }
  // So response is { success: true, data: article }
  const response = await apiClient.get(`/news/article/${encodedId}`);
  // Extract article from response.data
  return response?.data || response;
};

