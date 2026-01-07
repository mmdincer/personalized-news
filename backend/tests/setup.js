/**
 * Jest setup file
 * Runs before all tests
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = process.env.TEST_PORT || '3001'; // Use different port for tests

// Only set defaults if not already set (allow .env file to override)
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-jwt-secret-key-min-64-chars-for-testing-purposes-only';
}
if (!process.env.GUARDIAN_API_KEY) {
  process.env.GUARDIAN_API_KEY = 'test-guardian-api-key';
}
if (!process.env.CORS_ORIGINS) {
  process.env.CORS_ORIGINS = 'http://localhost:5173';
}

// Note: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY should be set from .env file
// Integration tests require real Supabase connection
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️  Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. Integration tests may fail.');
  console.warn('   Please ensure .env file exists with valid Supabase credentials.');
}

// Increase timeout for integration tests
jest.setTimeout(30000);

