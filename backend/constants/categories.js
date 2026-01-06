/**
 * News Categories Constants
 * 
 * Defines supported news categories based on The Guardian API sections
 * These categories map directly to Guardian API section IDs
 */

// ===========================
// Supported Categories (Guardian API Sections)
// ===========================

/**
 * Allowed categories - mapped to The Guardian API sections
 * These are the most popular and useful sections from The Guardian API
 */
const ALLOWED_CATEGORIES = [
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
const CATEGORY_DISPLAY_NAMES = {
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
// Guardian API Section Mapping
// ===========================

/**
 * Mapping from internal categories to The Guardian API sections
 * Since we're using Guardian section IDs directly, this is a 1:1 mapping
 * This function exists for consistency and future flexibility
 */
const GUARDIAN_SECTION_MAPPING = {
  business: 'business',
  technology: 'technology',
  science: 'science',
  sport: 'sport',
  culture: 'culture',
  news: 'news',
  world: 'world',
  politics: 'politics',
  environment: 'environment',
  society: 'society',
  lifeandstyle: 'lifeandstyle',
  food: 'food',
  travel: 'travel',
  fashion: 'fashion',
  books: 'books',
  music: 'music',
  film: 'film',
  games: 'games',
  education: 'education',
  media: 'media',
};

// ===========================
// Default Categories
// ===========================

/**
 * Default categories for new users
 */
const DEFAULT_CATEGORIES = ['news', 'technology'];

// ===========================
// Validation Functions
// ===========================

/**
 * Check if a category is valid
 * @param {string} category - Category to validate
 * @returns {boolean} True if category is valid
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
 * @returns {Object} Validation result with isValid flag and errors array
 */
const validateCategories = (categories) => {
  if (!Array.isArray(categories)) {
    return {
      isValid: false,
      errors: ['Categories must be an array'],
    };
  }

  if (categories.length === 0) {
    return {
      isValid: false,
      errors: ['At least one category is required'],
    };
  }

  const errors = [];
  const seen = new Set();

  categories.forEach((category, index) => {
    const normalizedCategory = category?.toLowerCase()?.trim();

    if (!normalizedCategory) {
      errors.push(`Category at index ${index} is empty`);
      return;
    }

    if (seen.has(normalizedCategory)) {
      errors.push(`Duplicate category: ${normalizedCategory}`);
      return;
    }

    seen.add(normalizedCategory);

    if (!isValidCategory(normalizedCategory)) {
      errors.push(
        `Invalid category: ${normalizedCategory}. Allowed categories: ${ALLOWED_CATEGORIES.join(', ')}`
      );
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Normalize categories array (remove duplicates, lowercase, trim)
 * @param {Array<string>} categories - Array of categories to normalize
 * @returns {Array<string>} Normalized categories array
 */
const normalizeCategories = (categories) => {
  if (!Array.isArray(categories)) {
    return [];
  }

  const normalized = categories
    .map((cat) => cat?.toLowerCase()?.trim())
    .filter((cat) => cat && isValidCategory(cat));

  // Remove duplicates
  return [...new Set(normalized)];
};

// ===========================
// Mapping Functions
// ===========================

/**
 * Map internal category to The Guardian API section
 * Since we're using Guardian section IDs directly, this is a 1:1 mapping
 * @param {string} category - Internal category
 * @returns {string} Guardian section name
 * @throws {Error} If category is not allowed
 */
const mapCategoryToGuardianSection = (category) => {
  if (!isValidCategory(category)) {
    const error = new Error(
      `Invalid category: ${category}. Allowed: ${ALLOWED_CATEGORIES.join(', ')}`
    );
    error.code = 'VAL_INVALID_CATEGORY';
    error.statusCode = 400;
    throw error;
  }
  const normalizedCategory = category.toLowerCase();
  return GUARDIAN_SECTION_MAPPING[normalizedCategory];
};

/**
 * Get display name for a category
 * @param {string} category - Category ID
 * @returns {string} Display name
 */
const getCategoryDisplayName = (category) => {
  const normalized = category?.toLowerCase();
  return CATEGORY_DISPLAY_NAMES[normalized] || category || 'Unknown';
};

/**
 * Get all categories with their display names
 * @returns {Array<Object>} Array of {id, name} objects
 */
const getAllCategoriesWithNames = () => {
  return ALLOWED_CATEGORIES.map((id) => ({
    id,
    name: CATEGORY_DISPLAY_NAMES[id],
  }));
};

// ===========================
// Module Exports
// ===========================

module.exports = {
  ALLOWED_CATEGORIES,
  CATEGORY_DISPLAY_NAMES,
  GUARDIAN_SECTION_MAPPING,
  DEFAULT_CATEGORIES,
  isValidCategory,
  validateCategories,
  normalizeCategories,
  getCategoryDisplayName,
  getAllCategoriesWithNames,
  mapCategoryToGuardianSection,
};
