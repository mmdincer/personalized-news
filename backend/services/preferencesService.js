const supabase = require('../config/database');
const {
  validateCategories,
  normalizeCategories,
} = require('../constants/categories');

/**
 * Get user preferences from database
 * @param {string} userId - User ID (UUID)
 * @returns {Promise<{categories: Array<string>}>} User preferences
 * @throws {Error} If user ID is invalid or query fails
 */
const getUserPreferences = async (userId) => {
  // Validate user ID
  if (!userId || typeof userId !== 'string') {
    throw new Error('User ID is required');
  }

  // Query user preferences
  const { data, error } = await supabase
    .from('user_preferences')
    .select('categories')
    .eq('user_id', userId)
    .single();

  // Handle query errors
  if (error) {
    // If preferences don't exist, return default preferences
    if (error.code === 'PGRST116') {
      // PostgreSQL "no rows" error
      return {
        categories: ['general', 'technology'], // Default categories
      };
    }
    throw new Error(`Failed to fetch user preferences: ${error.message}`);
  }

  // Return preferences
  return {
    categories: data.categories || ['general', 'technology'],
  };
};

/**
 * Update or create user preferences (upsert)
 * @param {string} userId - User ID (UUID)
 * @param {Object} preferences - Preferences to update
 * @param {Array<string>} [preferences.categories] - News categories
 * @returns {Promise<{categories: Array<string>}>} Updated preferences
 * @throws {Error} If validation fails or query fails
 */
const updateUserPreferences = async (userId, preferences) => {
  // Validate user ID
  if (!userId || typeof userId !== 'string') {
    throw new Error('User ID is required');
  }

  // Validate preferences object
  if (!preferences || typeof preferences !== 'object') {
    throw new Error('Preferences object is required');
  }

  // Prepare update data
  const updateData = {
    user_id: userId,
    updated_at: new Date().toISOString(),
  };

  // Validate and add categories if provided
  if (preferences.categories !== undefined) {
    // Validate categories
    if (!Array.isArray(preferences.categories)) {
      throw new Error('Categories must be an array');
    }

    // Check for empty array before processing
    if (preferences.categories.length === 0) {
      throw new Error('At least one category must be selected');
    }

    // First, validate raw categories before normalization
    // This ensures we catch invalid categories and provide clear error messages
    const rawValidation = validateCategories(preferences.categories);
    if (!rawValidation.isValid) {
      throw new Error(
        `Invalid categories: ${rawValidation.invalidCategories.join(', ')}`
      );
    }

    // Now normalize categories (lowercase, remove duplicates)
    // Since we already validated, normalization will only clean up format
    const normalizedCategories = normalizeCategories(preferences.categories);

    // Double-check after normalization (should always pass if raw validation passed)
    if (normalizedCategories.length === 0) {
      throw new Error('At least one category must be selected');
    }

    updateData.categories = normalizedCategories;
  }

  // Perform upsert (insert or update)
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert(updateData, {
      onConflict: 'user_id', // Update if user_id exists
      returning: 'representation', // Return updated row
    })
    .select('categories')
    .single();

  // Handle query errors
  if (error) {
    throw new Error(`Failed to update user preferences: ${error.message}`);
  }

  // Return updated preferences
  return {
    categories: data.categories,
  };
};

/**
 * Create default preferences for a new user
 * @param {string} userId - User ID (UUID)
 * @returns {Promise<{categories: Array<string>}>} Created preferences
 * @throws {Error} If user ID is invalid or creation fails
 */
const createDefaultPreferences = async (userId) => {
  // Validate user ID
  if (!userId || typeof userId !== 'string') {
    throw new Error('User ID is required');
  }

  // Insert default preferences
  const { data, error } = await supabase
    .from('user_preferences')
    .insert({
      user_id: userId,
      categories: ['general', 'technology'], // Default categories
    })
    .select('categories')
    .single();

  // Handle query errors
  if (error) {
    // If preferences already exist, return existing preferences
    if (error.code === '23505') {
      // PostgreSQL unique violation
      return await getUserPreferences(userId);
    }
    throw new Error(`Failed to create default preferences: ${error.message}`);
  }

  // Return created preferences
  return {
    categories: data.categories,
  };
};

/**
 * Delete user preferences
 * @param {string} userId - User ID (UUID)
 * @returns {Promise<void>}
 * @throws {Error} If user ID is invalid or deletion fails
 */
const deleteUserPreferences = async (userId) => {
  // Validate user ID
  if (!userId || typeof userId !== 'string') {
    throw new Error('User ID is required');
  }

  // Delete preferences
  const { error } = await supabase
    .from('user_preferences')
    .delete()
    .eq('user_id', userId);

  // Handle query errors
  if (error) {
    throw new Error(`Failed to delete user preferences: ${error.message}`);
  }
};

module.exports = {
  getUserPreferences,
  updateUserPreferences,
  createDefaultPreferences,
  deleteUserPreferences,
};
