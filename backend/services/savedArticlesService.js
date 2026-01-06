const supabase = require('../config/database');

/**
 * Save an article for a user
 * @param {string} userId - User ID (UUID)
 * @param {Object} articleData - Article data to save
 * @param {string} articleData.article_url - Article URL (required)
 * @param {string} articleData.article_title - Article title (required)
 * @param {string} [articleData.article_image_url] - Article image URL (optional)
 * @returns {Promise<Object>} Saved article data
 * @throws {Error} If validation fails or query fails
 */
const saveArticle = async (userId, articleData) => {
  // Validate user ID
  if (!userId || typeof userId !== 'string') {
    throw new Error('User ID is required');
  }

  // Validate article data
  if (!articleData || typeof articleData !== 'object') {
    throw new Error('Article data is required');
  }

  const { article_url, article_title, article_image_url } = articleData;

  // Validate required fields
  if (!article_url || typeof article_url !== 'string' || article_url.trim().length === 0) {
    throw new Error('Article URL is required');
  }

  if (!article_title || typeof article_title !== 'string' || article_title.trim().length === 0) {
    throw new Error('Article title is required');
  }

  // Validate URL length (VARCHAR(500) constraint)
  if (article_url.length > 500) {
    throw new Error('Article URL must be 500 characters or less');
  }

  if (article_title.length > 500) {
    throw new Error('Article title must be 500 characters or less');
  }

  if (article_image_url && article_image_url.length > 500) {
    throw new Error('Article image URL must be 500 characters or less');
  }

  // Prepare insert data
  const insertData = {
    user_id: userId,
    article_url: article_url.trim(),
    article_title: article_title.trim(),
    saved_at: new Date().toISOString(),
  };

  // Add optional image URL if provided
  if (article_image_url) {
    insertData.article_image_url = article_image_url.trim();
  }

  // Insert article (UNIQUE constraint on user_id + article_url will prevent duplicates)
  const { data, error } = await supabase
    .from('saved_articles')
    .insert(insertData)
    .select('id, article_url, article_title, article_image_url, saved_at')
    .single();

  // Handle query errors
  if (error) {
    // Check for unique constraint violation (duplicate article)
    if (error.code === '23505') {
      // PostgreSQL unique violation
      throw new Error('Article is already saved');
    }
    throw new Error(`Failed to save article: ${error.message}`);
  }

  return {
    id: data.id,
    article_url: data.article_url,
    article_title: data.article_title,
    article_image_url: data.article_image_url,
    saved_at: data.saved_at,
  };
};

/**
 * Get all saved articles for a user
 * @param {string} userId - User ID (UUID)
 * @returns {Promise<Array<Object>>} Array of saved articles
 * @throws {Error} If user ID is invalid or query fails
 */
const getSavedArticles = async (userId) => {
  // Validate user ID
  if (!userId || typeof userId !== 'string') {
    throw new Error('User ID is required');
  }

  // Query saved articles (ordered by saved_at DESC - newest first)
  const { data, error } = await supabase
    .from('saved_articles')
    .select('id, article_url, article_title, article_image_url, saved_at')
    .eq('user_id', userId)
    .order('saved_at', { ascending: false });

  // Handle query errors
  if (error) {
    throw new Error(`Failed to fetch saved articles: ${error.message}`);
  }

  // Return articles (empty array if none found)
  return data || [];
};

/**
 * Delete a saved article
 * @param {string} userId - User ID (UUID)
 * @param {string} articleId - Saved article ID (UUID)
 * @returns {Promise<void>}
 * @throws {Error} If user ID or article ID is invalid, or if article doesn't belong to user
 */
const deleteSavedArticle = async (userId, articleId) => {
  // Validate user ID
  if (!userId || typeof userId !== 'string') {
    throw new Error('User ID is required');
  }

  // Validate article ID
  if (!articleId || typeof articleId !== 'string') {
    throw new Error('Article ID is required');
  }

  // Delete article (only if it belongs to the user)
  const { data, error } = await supabase
    .from('saved_articles')
    .delete()
    .eq('id', articleId)
    .eq('user_id', userId)
    .select('id')
    .single();

  // Handle query errors
  if (error) {
    // If no rows affected, article doesn't exist or doesn't belong to user
    if (error.code === 'PGRST116') {
      throw new Error('Saved article not found or access denied');
    }
    throw new Error(`Failed to delete saved article: ${error.message}`);
  }

  // Check if article was actually deleted
  if (!data) {
    throw new Error('Saved article not found or access denied');
  }
};

/**
 * Check if an article is saved by a user
 * @param {string} userId - User ID (UUID)
 * @param {string} articleUrl - Article URL
 * @returns {Promise<Object|null>} Saved article data if found, null otherwise
 * @throws {Error} If user ID or article URL is invalid
 */
const isArticleSaved = async (userId, articleUrl) => {
  // Validate user ID
  if (!userId || typeof userId !== 'string') {
    throw new Error('User ID is required');
  }

  // Validate article URL
  if (!articleUrl || typeof articleUrl !== 'string' || articleUrl.trim().length === 0) {
    throw new Error('Article URL is required');
  }

  // Query saved article
  const { data, error } = await supabase
    .from('saved_articles')
    .select('id, article_url, article_title, article_image_url, saved_at')
    .eq('user_id', userId)
    .eq('article_url', articleUrl.trim())
    .single();

  // Handle query errors
  if (error) {
    // If no rows found, article is not saved
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to check if article is saved: ${error.message}`);
  }

  return data;
};

module.exports = {
  saveArticle,
  getSavedArticles,
  deleteSavedArticle,
  isArticleSaved,
};

