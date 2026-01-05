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

// Test connection on module load (optional - can be removed if preferred)
const testConnection = async () => {
  try {
    // Simple query to test connection
    const { error } = await supabase.from('users').select('id').limit(1);
    
    // If table doesn't exist yet, that's OK (migrations not run)
    // Only log actual connection errors
    if (error && error.code !== 'PGRST116') {
      // eslint-disable-next-line no-console
      console.warn('Supabase connection warning:', error.message);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Supabase connection test failed:', err.message);
  }
};

// Test connection in development mode only
if (process.env.NODE_ENV === 'development') {
  testConnection();
}

module.exports = supabase;

