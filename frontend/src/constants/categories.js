/**
 * News categories constants
 * Based on NewsAPI.org supported categories
 */

// Allowed news categories
export const ALLOWED_CATEGORIES = [
  'business',
  'entertainment',
  'general',
  'health',
  'science',
  'sports',
  'technology',
];

// Display names mapping for categories
export const CATEGORY_DISPLAY_NAMES = {
  business: 'Business',
  entertainment: 'Entertainment',
  general: 'General',
  health: 'Health',
  science: 'Science',
  sports: 'Sports',
  technology: 'Technology',
};

/**
 * Get display name for a category
 * @param {string} category - Category code
 * @returns {string} Display name or category code if not found
 */
export const getCategoryDisplayName = (category) => {
  if (!category || typeof category !== 'string') {
    return category || '';
  }
  return CATEGORY_DISPLAY_NAMES[category.toLowerCase()] || category;
};

/**
 * Get all categories with display names
 * @returns {Array<{code: string, name: string}>} Array of category objects
 */
export const getAllCategoriesWithNames = () => {
  return ALLOWED_CATEGORIES.map((code) => ({
    code,
    name: getCategoryDisplayName(code),
  }));
};

