require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Validate required environment variables
if (!process.env.SUPABASE_URL) {
  throw new Error('SUPABASE_URL environment variable is required');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
}

// Create Supabase client instance (singleton pattern)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Retry connection with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum retries (default: 3)
 * @param {number} initialDelay - Initial delay in ms (default: 1000)
 * @returns {Promise} Result of function
 */
const retryConnection = async (fn, maxRetries = 3, initialDelay = 1000) => {
  let lastError;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if we've exhausted retries
      if (attempt === maxRetries) {
        throw error;
      }

      // Wait before retrying with exponential backoff
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * 2, 10000); // Max 10 seconds
    }
  }

  throw lastError;
};

/**
 * Test connection with retry logic
 * @returns {Promise<void>}
 */
const testConnection = async () => {
  try {
    await retryConnection(async () => {
      const { error } = await supabase.from('users').select('id').limit(1);
      
      // If table doesn't exist yet, that's OK (migrations not run)
      // Only throw on actual connection errors
      if (error && error.code !== 'PGRST116') {
        throw new Error(`Supabase connection error: ${error.message}`);
      }
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Supabase connection test failed after retries:', err.message);
  }
};

// Test connection in development mode only
if (process.env.NODE_ENV === 'development') {
  testConnection();
}

module.exports = supabase;

