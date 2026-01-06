/**
 * News Service Layer
 *
 * SRP: Pure business logic for NewsAPI.org integration
 * - Handles NewsAPI.org API calls
 * - Implements caching strategy (15 minutes)
 * - Manages rate limiting (100/day, 1/sec)
 * - Normalizes API responses
 * - NO HTTP concerns (controllers handle that)
 */

const axios = require('axios');
const winston = require('winston');
const { ALLOWED_CATEGORIES } = require('../constants/categories');

// ===========================
// Winston Logger Configuration
// ===========================

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'news-service' },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// In production, also log to file
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/news-service-error.log',
      level: 'error',
    })
  );
  logger.add(
    new winston.transports.File({
      filename: 'logs/news-service.log',
    })
  );
}

// ===========================
// Configuration Constants
// ===========================

const NEWSAPI_BASE_URL = 'https://newsapi.org/v2';
const NEWSAPI_ENDPOINT = '/top-headlines';
const REQUEST_TIMEOUT_MS = 10000; // 10 seconds
const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_DAY = 100;
const MAX_REQUESTS_PER_SECOND = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

// ===========================
// In-Memory Cache
// ===========================

const cache = new Map();
const requestLog = [];

/**
 * Generate cache key for news requests
 * @param {string} category - News category
 * @param {number} page - Page number
 * @param {number} pageSize - Results per page
 * @returns {string} Cache key
 */
const getCacheKey = (category, page, pageSize) => {
  return `news:${category || 'all'}:${page}:${pageSize}`;
};

/**
 * Get cached news data
 * @param {string} key - Cache key
 * @returns {Object|null} Cached data or null if not found/expired
 */
const getCachedNews = (key) => {
  const cached = cache.get(key);
  if (!cached) {
    return null;
  }

  const now = Date.now();
  if (now - cached.timestamp > CACHE_DURATION_MS) {
    cache.delete(key);
    return null;
  }

  return cached.data;
};

/**
 * Store news data in cache
 * @param {string} key - Cache key
 * @param {Object} data - Data to cache
 */
const setCachedNews = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
};

/**
 * Clear all cached news data
 */
const clearCache = () => {
  cache.clear();
};

/**
 * Start periodic cache cleanup to prevent memory leaks
 * Removes expired entries every 5 minutes
 */
let cacheCleanupInterval = null;

const startCacheCleanup = () => {
  // Clear existing interval if any
  if (cacheCleanupInterval) {
    clearInterval(cacheCleanupInterval);
  }

  // Clean cache every 5 minutes
  cacheCleanupInterval = setInterval(() => {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, value] of cache.entries()) {
      if (now - value.timestamp > CACHE_DURATION_MS) {
        cache.delete(key);
        cleanedCount++;
      }
    }

    // Log cache cleanup
    if (cleanedCount > 0) {
      logger.info(`Cache cleanup: Removed ${cleanedCount} expired entries`);
    }
  }, 5 * 60 * 1000); // 5 minutes
};

/**
 * Stop cache cleanup interval
 */
const stopCacheCleanup = () => {
  if (cacheCleanupInterval) {
    clearInterval(cacheCleanupInterval);
    cacheCleanupInterval = null;
  }
};

// ===========================
// Rate Limiting
// ===========================

/**
 * Check rate limit and reserve a slot atomically
 * This prevents race conditions where multiple requests pass the check simultaneously
 * @returns {{allowed: boolean, dailyCount: number, message: string}} Rate limit status
 */
const checkRateLimitAndReserve = () => {
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const oneSecondAgo = now - 1000;

  // Clean old entries (older than 24 hours)
  const recentRequests = requestLog.filter((timestamp) => timestamp > oneDayAgo);
  requestLog.length = 0;
  requestLog.push(...recentRequests);

  // Check daily limit
  if (recentRequests.length >= MAX_REQUESTS_PER_DAY) {
    return {
      allowed: false,
      dailyCount: recentRequests.length,
      message: 'Daily rate limit exceeded (100 requests/day)',
    };
  }

  // Check per-second limit
  const requestsLastSecond = recentRequests.filter((timestamp) => timestamp > oneSecondAgo);
  if (requestsLastSecond.length >= MAX_REQUESTS_PER_SECOND) {
    return {
      allowed: false,
      dailyCount: recentRequests.length,
      message: 'Per-second rate limit exceeded (1 request/second)',
    };
  }

  // Reserve slot atomically (before API call)
  requestLog.push(now);

  return {
    allowed: true,
    dailyCount: recentRequests.length + 1,
    message: 'Rate limit OK',
  };
};


/**
 * Get rate limit statistics
 * @returns {{dailyCount: number, remaining: number}} Rate limit stats
 */
const getRateLimitStats = () => {
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const recentRequests = requestLog.filter((timestamp) => timestamp > oneDayAgo);

  const stats = {
    dailyCount: recentRequests.length,
    remaining: MAX_REQUESTS_PER_DAY - recentRequests.length,
  };

  // Log rate limit stats access
  logger.debug('Rate limit statistics requested', stats);

  return stats;
};

// ===========================
// Axios Instance Configuration
// ===========================

const newsApiClient = axios.create({
  baseURL: NEWSAPI_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add API key
newsApiClient.interceptors.request.use(
  (config) => {
    // Add API key to params
    config.params = {
      ...config.params,
      apiKey: process.env.NEWSAPI_KEY,
    };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle errors
newsApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Timeout error (specific)
    if (error.code === 'ECONNABORTED') {
      const timeoutError = new Error('NewsAPI.org request timeout after 10s');
      timeoutError.code = 'NEWS_API_TIMEOUT';
      timeoutError.statusCode = 504;
      throw timeoutError;
    }

    // Network error (no response)
    if (!error.response) {
      const networkError = new Error('Network error: Unable to reach NewsAPI.org');
      networkError.code = 'NEWS_NETWORK_ERROR';
      networkError.statusCode = 503;
      throw networkError;
    }

    // API error responses
    const { status, data } = error.response;
    let apiError;

    switch (status) {
      case 401:
        apiError = new Error('Invalid NewsAPI.org API key');
        apiError.code = 'NEWS_API_INVALID_KEY';
        apiError.statusCode = 500; // Internal error (config issue)
        break;

      case 429:
        apiError = new Error('NewsAPI.org rate limit exceeded');
        apiError.code = 'NEWS_API_RATE_LIMIT';
        apiError.statusCode = 429;
        break;

      case 500:
        apiError = new Error('NewsAPI.org server error');
        apiError.code = 'NEWS_API_SERVER_ERROR';
        apiError.statusCode = 503;
        break;

      default:
        apiError = new Error(data?.message || 'NewsAPI.org request failed');
        apiError.code = 'NEWS_API_ERROR';
        apiError.statusCode = 500;
    }

    throw apiError;
  }
);

// ===========================
// Response Normalization
// ===========================

/**
 * Normalize NewsAPI.org response to internal format
 * @param {Object} apiResponse - Raw NewsAPI.org response
 * @param {number} page - Current page number
 * @param {number} pageSize - Results per page
 * @returns {Object} Normalized response
 */
const normalizeNewsResponse = (apiResponse, page, pageSize) => {
  if (!apiResponse || !apiResponse.articles) {
    return {
      articles: [],
      totalResults: 0,
      page,
      pageSize,
    };
  }

  // Normalize articles
  const articles = apiResponse.articles.map((article) => ({
    title: article.title || 'No title',
    description: article.description || '',
    url: article.url || '',
    imageUrl: article.urlToImage || null,
    publishedAt: article.publishedAt || new Date().toISOString(),
    source: {
      name: article.source?.name || 'Unknown',
    },
  }));

  return {
    articles,
    totalResults: apiResponse.totalResults || articles.length,
    page,
    pageSize,
  };
};

// ===========================
// Input Validation
// ===========================

/**
 * Validate category parameter
 * @param {string} category - Category to validate
 * @throws {Error} If category is invalid
 */
const validateCategory = (category) => {
  if (!category) {
    const error = new Error('Category is required');
    error.code = 'VAL_MISSING_CATEGORY';
    error.statusCode = 400;
    throw error;
  }

  if (!ALLOWED_CATEGORIES.includes(category.toLowerCase())) {
    const error = new Error(
      `Invalid category. Allowed: ${ALLOWED_CATEGORIES.join(', ')}`
    );
    error.code = 'VAL_INVALID_CATEGORY';
    error.statusCode = 400;
    throw error;
  }
};


/**
 * Validate pagination parameters
 * @param {number} page - Page number
 * @param {number} pageSize - Results per page
 * @throws {Error} If parameters are invalid
 */
const validatePagination = (page, pageSize) => {
  if (page < 1) {
    const error = new Error('Page number must be >= 1');
    error.code = 'VAL_INVALID_PAGE';
    error.statusCode = 400;
    throw error;
  }

  if (pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
    const error = new Error(`Page size must be between 1 and ${MAX_PAGE_SIZE}`);
    error.code = 'VAL_INVALID_PAGE_SIZE';
    error.statusCode = 400;
    throw error;
  }
};

// ===========================
// Core Service Functions
// ===========================

/**
 * Fetch news by category
 * @param {string} category - News category
 * @param {number} page - Page number (default: 1)
 * @param {number} pageSize - Results per page (default: 20)
 * @returns {Promise<Object>} Normalized news data
 * @throws {Error} On validation or API errors
 */
const fetchNewsByCategory = async (
  category,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE
) => {
  // Validate inputs
  validateCategory(category);
  validatePagination(page, pageSize);

  // Check cache first
  const cacheKey = getCacheKey(category, page, pageSize);
  const cached = getCachedNews(cacheKey);
  if (cached) {
    return cached;
  }

  // Check rate limit and reserve slot atomically
  const rateLimit = checkRateLimitAndReserve();
  if (!rateLimit.allowed) {
    // Log rate limit exceeded
    logger.warn(`Rate limit exceeded: ${rateLimit.message}`, {
      dailyCount: rateLimit.dailyCount,
      cacheKey,
    });

    // Rate limit exceeded - try to return cached data (even if expired)
    // This provides graceful degradation when rate limit is reached
    const expiredCache = cache.get(cacheKey);
    if (expiredCache) {
      logger.info('Returning expired cache due to rate limit', { cacheKey });
      // Return expired cache data (better than error)
      return expiredCache.data;
    }

    // No cache available - throw error
    logger.error('Rate limit exceeded and no cache available', {
      cacheKey,
      dailyCount: rateLimit.dailyCount,
    });
    const error = new Error(rateLimit.message);
    error.code = 'NEWS_RATE_LIMIT_EXCEEDED';
    error.statusCode = 429;
    throw error;
  }

  // Log API request
  logger.info('Fetching news from NewsAPI.org', {
    category,
    page,
    pageSize,
    cacheKey,
  });

  // Make API request (no country parameter - uses NewsAPI.org default)
  const response = await newsApiClient.get(NEWSAPI_ENDPOINT, {
    params: {
      category: category.toLowerCase(),
      page,
      pageSize,
    },
  });

  // Note: Request already logged in checkRateLimitAndReserve()

  // Normalize response
  const normalizedData = normalizeNewsResponse(response.data, page, pageSize);

  // Cache result
  setCachedNews(cacheKey, normalizedData);

  logger.info('News fetched and cached successfully', {
    cacheKey,
    articleCount: normalizedData.articles.length,
    totalResults: normalizedData.totalResults,
  });

  return normalizedData;
};

/**
 * Fetch news from all user's preferred categories
 *
 * NOTE: This function always fetches page 1 from each category and returns aggregated results.
 * Pagination is applied AFTER aggregation. For true pagination across categories,
 * consider fetching from a single category using fetchNewsByCategory().
 *
 * @param {Array<string>} categories - User's preferred categories
 * @param {number} page - Page number (applied after aggregation)
 * @param {number} pageSize - Results per page
 * @returns {Promise<Object>} Aggregated news from all categories
 * @throws {Error} On validation or API errors
 */
const fetchNewsByPreferences = async (
  categories,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE
) => {
  if (!Array.isArray(categories) || categories.length === 0) {
    const error = new Error('At least one category is required');
    error.code = 'VAL_MISSING_CATEGORIES';
    error.statusCode = 400;
    throw error;
  }

  // Validate all categories
  categories.forEach((category) => validateCategory(category));
  validatePagination(page, pageSize);

  // Fetch news from all categories (always page 1 from each category)
  const resultsPerCategory = Math.ceil(pageSize / categories.length);
  const promises = categories.map((category) =>
    fetchNewsByCategory(category, 1, resultsPerCategory)
  );

  const results = await Promise.all(promises);

  // Aggregate results
  const allArticles = results.flatMap((result) => result.articles);

  // Sort by publishedAt (newest first)
  allArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  // Apply pagination to aggregated results
  const startIndex = (page - 1) * pageSize;
  const paginatedArticles = allArticles.slice(startIndex, startIndex + pageSize);

  return {
    articles: paginatedArticles,
    totalResults: allArticles.length, // Actual available articles (not sum of all categories)
    page,
    pageSize,
  };
};

// ===========================
// Module Exports
// ===========================

module.exports = {
  // Core functions
  fetchNewsByCategory,
  fetchNewsByPreferences,

  // Cache management
  clearCache,
  getCacheKey,
  startCacheCleanup,
  stopCacheCleanup,

  // Rate limiting
  getRateLimitStats,

  // Constants (for testing)
  CACHE_DURATION_MS,
  MAX_REQUESTS_PER_DAY,
  MAX_REQUESTS_PER_SECOND,
};
