/**
 * News Categories Constants (Frontend)
 * 
 * Defines supported news categories based on The Guardian API sections
 * These categories map directly to Guardian API section IDs
 * 
 * Note: This file should match backend/constants/categories.js
 */

// ===========================
// Supported Categories (Guardian API Sections)
// ===========================

/**
 * Allowed categories - mapped to The Guardian API sections
 * These are the most popular and useful sections from The Guardian API
 */
export const ALLOWED_CATEGORIES = [
  'business',      // Business news
  'technology',    // Technology news
  'science',       // Science news
  'sport',         // Sports news (Guardian uses singular 'sport')
  'culture',       // Culture/Entertainment news
  'news',          // General news
  'world',         // World news
  'politics',      // Politics news
  'environment',   // Environment news
  'society',       // Society news (includes health, social issues)
  'lifeandstyle',  // Life and style
  'food',          // Food news
  'travel',        // Travel news
  'fashion',       // Fashion news
  'books',         // Books news
  'music',         // Music news
  'film',          // Film news
  'games',         // Games news
  'education',     // Education news
  'media',         // Media news
];

// ===========================
// Category Display Names
// ===========================

/**
 * Human-readable display names for categories
 */
export const CATEGORY_DISPLAY_NAMES = {
  business: 'Business',
  technology: 'Technology',
  science: 'Science',
  sport: 'Sports',
  culture: 'Culture',
  news: 'News',
  world: 'World',
  politics: 'Politics',
  environment: 'Environment',
  society: 'Society',
  lifeandstyle: 'Life & Style',
  food: 'Food',
  travel: 'Travel',
  fashion: 'Fashion',
  books: 'Books',
  music: 'Music',
  film: 'Film',
  games: 'Games',
  education: 'Education',
  media: 'Media',
};

// ===========================
// Helper Functions
// ===========================

/**
 * Get display name for a category
 * @param {string} category - Category ID
 * @returns {string} Display name
 */
export const getCategoryDisplayName = (category) => {
  const normalized = category?.toLowerCase();
  return CATEGORY_DISPLAY_NAMES[normalized] || category || 'Unknown';
};

/**
 * Get all categories with their display names
 * @returns {Array<Object>} Array of {code, name} objects
 */
export const getAllCategoriesWithNames = () => {
  return ALLOWED_CATEGORIES.map((code) => ({
    code,
    name: CATEGORY_DISPLAY_NAMES[code],
  }));
};

/**
 * Check if a category is valid
 * @param {string} category - Category to validate
 * @returns {boolean} True if category is valid
 */
export const isValidCategory = (category) => {
  if (!category || typeof category !== 'string') {
    return false;
  }
  return ALLOWED_CATEGORIES.includes(category.toLowerCase());
};
