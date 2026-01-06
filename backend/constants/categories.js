/**
 * News categories constants
 * Based on NewsAPI.org supported categories
 * @see https://newsapi.org/docs/endpoints/top-headlines
 */

// Allowed news categories
const ALLOWED_CATEGORIES = [
  'business',      // Business news
  'entertainment', // Entertainment news
  'general',      // General news
  'health',        // Health news
  'science',       // Science news
  'sports',        // Sports news
  'technology',    // Technology news
];

// Display names mapping for categories
const CATEGORY_DISPLAY_NAMES = {
  business: 'Business',
  entertainment: 'Entertainment',
  general: 'General',
  health: 'Health',
  science: 'Science',
  sports: 'Sports',
  technology: 'Technology',
};

/**
 * Validate if a category is allowed
 * @param {string} category - Category to validate
 * @returns {boolean} True if category is valid, false otherwise
 */
const isValidCategory = (category) => {
  if (!category || typeof category !== 'string') {
    return false;
  }
  return ALLOWED_CATEGORIES.includes(category.toLowerCase());
};

/**
 * Validate an array of categories
 * @param {Array<string>} categories - Array of categories to validate
 * @returns {{isValid: boolean, invalidCategories: string[]}} Validation result
 */
const validateCategories = (categories) => {
  if (!Array.isArray(categories)) {
    return {
      isValid: false,
      invalidCategories: [],
    };
  }

  const invalidCategories = categories.filter(
    (category) => !isValidCategory(category)
  );

  return {
    isValid: invalidCategories.length === 0,
    invalidCategories,
  };
};

/**
 * Normalize categories (lowercase, remove duplicates)
 * @param {Array<string>} categories - Array of categories to normalize
 * @returns {Array<string>} Normalized array of categories
 */
const normalizeCategories = (categories) => {
  if (!Array.isArray(categories)) {
    return [];
  }

  // Normalize: lowercase, remove duplicates, filter invalid
  const normalized = categories
    .map((cat) => (typeof cat === 'string' ? cat.toLowerCase().trim() : null))
    .filter((cat) => cat && isValidCategory(cat));

  // Remove duplicates
  return [...new Set(normalized)];
};

/**
 * Get display name for a category
 * @param {string} category - Category code
 * @returns {string} Display name or category code if not found
 */
const getCategoryDisplayName = (category) => {
  if (!category || typeof category !== 'string') {
    return category || '';
  }
  return CATEGORY_DISPLAY_NAMES[category.toLowerCase()] || category;
};

/**
 * Get all categories with display names
 * @returns {Array<{code: string, name: string}>} Array of category objects
 */
const getAllCategoriesWithNames = () => {
  return ALLOWED_CATEGORIES.map((code) => ({
    code,
    name: getCategoryDisplayName(code),
  }));
};

module.exports = {
  ALLOWED_CATEGORIES,
  CATEGORY_DISPLAY_NAMES,
  isValidCategory,
  validateCategories,
  normalizeCategories,
  getCategoryDisplayName,
  getAllCategoriesWithNames,
};

