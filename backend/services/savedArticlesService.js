const supabase = require('../config/database');
const newsService = require('./newsService');

/**
 * Save an article for a user
 * Fetches full article details from Guardian API and saves them
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

  // Try to fetch full article details from Guardian API
  let articleDetails = null;
  try {
    // Only fetch if it's a Guardian URL
    if (article_url.startsWith('https://www.theguardian.com/')) {
      articleDetails = await newsService.fetchArticleById(article_url);
    }
  } catch (error) {
    // If fetching fails, continue with basic data (don't fail the save operation)
    // This allows saving articles even if Guardian API is unavailable
    console.warn('Failed to fetch article details from Guardian API:', error.message);
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
  } else if (articleDetails?.imageUrl) {
    // Use image from Guardian API if not provided
    insertData.article_image_url = articleDetails.imageUrl.substring(0, 500);
  }

  // Add article details if fetched successfully
  if (articleDetails) {
    if (articleDetails.description) {
      insertData.article_description = articleDetails.description;
    }
    if (articleDetails.content) {
      insertData.article_content = articleDetails.content;
    }
    if (articleDetails.source?.name) {
      insertData.article_source_name = articleDetails.source.name.substring(0, 100);
    }
    if (articleDetails.publishedAt) {
      insertData.article_published_at = articleDetails.publishedAt;
    }
  }

  // Check if article is already saved (before inserting)
  // This allows us to return existing article details if duplicate
  const existingArticle = await isArticleSaved(userId, article_url.trim());
  
  if (existingArticle) {
    // Article already saved - return existing article
    // Optionally update article details if we fetched new ones from Guardian API
    if (articleDetails) {
      const updateData = {};
      let needsUpdate = false;

      // Update description if we have a new one and existing is empty
      if (articleDetails.description && !existingArticle.article_description) {
        updateData.article_description = articleDetails.description;
        needsUpdate = true;
      }

      // Update content if we have a new one and existing is empty
      if (articleDetails.content && !existingArticle.article_content) {
        updateData.article_content = articleDetails.content;
        needsUpdate = true;
      }

      // Update source name if we have a new one and existing is empty
      if (articleDetails.source?.name && !existingArticle.article_source_name) {
        updateData.article_source_name = articleDetails.source.name.substring(0, 100);
        needsUpdate = true;
      }

      // Update published date if we have a new one and existing is empty
      if (articleDetails.publishedAt && !existingArticle.article_published_at) {
        updateData.article_published_at = articleDetails.publishedAt;
        needsUpdate = true;
      }

      // Update image if we have a new one and existing is empty
      if (articleDetails.imageUrl && !existingArticle.article_image_url) {
        updateData.article_image_url = articleDetails.imageUrl.substring(0, 500);
        needsUpdate = true;
      }

      // Update article if we have new details
      if (needsUpdate) {
        const { data: updatedData, error: updateError } = await supabase
          .from('saved_articles')
          .update(updateData)
          .eq('id', existingArticle.id)
          .select('id, article_url, article_title, article_image_url, article_description, article_content, article_source_name, article_published_at, saved_at')
          .single();

        if (!updateError && updatedData) {
          return {
            id: updatedData.id,
            article_url: updatedData.article_url,
            article_title: updatedData.article_title,
            article_image_url: updatedData.article_image_url,
            article_description: updatedData.article_description,
            article_content: updatedData.article_content,
            article_source_name: updatedData.article_source_name,
            article_published_at: updatedData.article_published_at,
            saved_at: updatedData.saved_at,
          };
        }
      }
    }

    // Return existing article (no update needed or update failed)
    return {
      id: existingArticle.id,
      article_url: existingArticle.article_url,
      article_title: existingArticle.article_title,
      article_image_url: existingArticle.article_image_url,
      article_description: existingArticle.article_description,
      article_content: existingArticle.article_content,
      article_source_name: existingArticle.article_source_name,
      article_published_at: existingArticle.article_published_at,
      saved_at: existingArticle.saved_at,
    };
  }

  // Insert new article (UNIQUE constraint on user_id + article_url will prevent duplicates)
  const { data, error } = await supabase
    .from('saved_articles')
    .insert(insertData)
    .select('id, article_url, article_title, article_image_url, article_description, article_content, article_source_name, article_published_at, saved_at')
    .single();

  // Handle query errors
  if (error) {
    // Check for unique constraint violation (duplicate article - race condition)
    if (error.code === '23505') {
      // PostgreSQL unique violation - article was saved between our check and insert
      // Fetch and return the existing article
      const existing = await isArticleSaved(userId, article_url.trim());
      if (existing) {
        return {
          id: existing.id,
          article_url: existing.article_url,
          article_title: existing.article_title,
          article_image_url: existing.article_image_url,
          article_description: existing.article_description,
          article_content: existing.article_content,
          article_source_name: existing.article_source_name,
          article_published_at: existing.article_published_at,
          saved_at: existing.saved_at,
        };
      }
      // Fallback error if we can't find the existing article
      throw new Error('Article is already saved');
    }
    throw new Error(`Failed to save article: ${error.message}`);
  }

  return {
    id: data.id,
    article_url: data.article_url,
    article_title: data.article_title,
    article_image_url: data.article_image_url,
    article_description: data.article_description,
    article_content: data.article_content,
    article_source_name: data.article_source_name,
    article_published_at: data.article_published_at,
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
    .select('id, article_url, article_title, article_image_url, article_description, article_content, article_source_name, article_published_at, saved_at')
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
    .select('id, article_url, article_title, article_image_url, article_description, article_content, article_source_name, article_published_at, saved_at')
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

/**
 * Get a saved article by ID
 * @param {string} userId - User ID (UUID)
 * @param {string} articleId - Saved article ID (UUID)
 * @returns {Promise<Object|null>} Saved article data if found, null otherwise
 * @throws {Error} If user ID or article ID is invalid
 */
const getSavedArticleById = async (userId, articleId) => {
  // Validate user ID
  if (!userId || typeof userId !== 'string') {
    throw new Error('User ID is required');
  }

  // Validate article ID
  if (!articleId || typeof articleId !== 'string') {
    throw new Error('Article ID is required');
  }

  // Query saved article
  const { data, error } = await supabase
    .from('saved_articles')
    .select('id, article_url, article_title, article_image_url, article_description, article_content, article_source_name, article_published_at, saved_at')
    .eq('id', articleId)
    .eq('user_id', userId)
    .single();

  // Handle query errors
  if (error) {
    // If no rows found, article doesn't exist or doesn't belong to user
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch saved article: ${error.message}`);
  }

  return data;
};

/**
 * Get a saved article by URL
 * @param {string} userId - User ID (UUID)
 * @param {string} articleUrl - Article URL
 * @returns {Promise<Object|null>} Saved article data if found, null otherwise
 * @throws {Error} If user ID or article URL is invalid
 */
const getSavedArticleByUrl = async (userId, articleUrl) => {
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
    .select('id, article_url, article_title, article_image_url, article_description, article_content, article_source_name, article_published_at, saved_at')
    .eq('user_id', userId)
    .eq('article_url', articleUrl.trim())
    .single();

  // Handle query errors
  if (error) {
    // If no rows found, article doesn't exist or doesn't belong to user
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch saved article: ${error.message}`);
  }

  return data;
};

module.exports = {
  saveArticle,
  getSavedArticles,
  deleteSavedArticle,
  isArticleSaved,
  getSavedArticleById,
  getSavedArticleByUrl,
};


