/**
 * Integration tests for User Preferences API endpoints
 * Tests GET and PUT /api/user/preferences
 */

const request = require('supertest');
const app = require('../../../server');
const supabase = require('../../../config/database');

// Mock user for testing
let testUser = null;
let authToken = null;

/**
 * Setup: Create test user and get auth token
 */
beforeAll(async () => {
  // Register a test user
  const registerResponse = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Test User Preferences',
      email: `test-prefs-${Date.now()}@example.com`,
      password: 'TestPass123!',
    });

  testUser = registerResponse.body.data.user;
  authToken = registerResponse.body.data.token;
});

/**
 * Cleanup: Delete test user and preferences
 */
afterAll(async () => {
  if (testUser) {
    // Delete user preferences
    await supabase
      .from('user_preferences')
      .delete()
      .eq('user_id', testUser.id);

    // Delete user
    await supabase.from('users').delete().eq('id', testUser.id);
  }
});

/**
 * Test Suite: GET /api/user/preferences
 */
describe('GET /api/user/preferences', () => {
  test('should return default preferences for new user', async () => {
    const response = await request(app)
      .get('/api/user/preferences')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('categories');
    expect(response.body.data).toHaveProperty('country');
    expect(Array.isArray(response.body.data.categories)).toBe(true);
    expect(response.body.data.categories).toContain('general');
    expect(response.body.data.categories).toContain('technology');
    expect(response.body.data.country).toBe('tr'); // Default country
  });

  test('should fail without authentication token', async () => {
    const response = await request(app).get('/api/user/preferences');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('AUTH_UNAUTHORIZED');
  });

  test('should fail with invalid token', async () => {
    const response = await request(app)
      .get('/api/user/preferences')
      .set('Authorization', 'Bearer invalid_token');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});

/**
 * Test Suite: PUT /api/user/preferences
 */
describe('PUT /api/user/preferences', () => {
  test('should update categories successfully', async () => {
    const newCategories = ['business', 'technology', 'science'];

    const response = await request(app)
      .put('/api/user/preferences')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ categories: newCategories });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.categories).toEqual(newCategories);
  });

  test('should update country successfully', async () => {
    const newCountry = 'us';

    const response = await request(app)
      .put('/api/user/preferences')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ country: newCountry });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.country).toBe(newCountry);
  });

  test('should update both categories and country', async () => {
    const newCategories = ['health', 'sports'];
    const newCountry = 'de';

    const response = await request(app)
      .put('/api/user/preferences')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        categories: newCategories,
        country: newCountry,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.categories).toEqual(newCategories);
    expect(response.body.data.country).toBe(newCountry);
  });

  test('should fail with invalid category', async () => {
    const invalidCategories = ['invalid_category', 'technology'];

    const response = await request(app)
      .put('/api/user/preferences')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ categories: invalidCategories });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('PREF_INVALID_CATEGORY');
  });

  test('should fail with invalid country', async () => {
    const invalidCountry = 'xx';

    const response = await request(app)
      .put('/api/user/preferences')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ country: invalidCountry });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('PREF_INVALID_COUNTRY');
  });

  test('should fail with empty categories array', async () => {
    const response = await request(app)
      .put('/api/user/preferences')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ categories: [] });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test('should fail without authentication', async () => {
    const response = await request(app)
      .put('/api/user/preferences')
      .send({ categories: ['business'] });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  test('should fail with no update fields', async () => {
    const response = await request(app)
      .put('/api/user/preferences')
      .set('Authorization', `Bearer ${authToken}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('should normalize categories (lowercase, dedup)', async () => {
    const duplicateCategories = [
      'BUSINESS',
      'business',
      'Technology',
      'technology',
    ];

    const response = await request(app)
      .put('/api/user/preferences')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ categories: duplicateCategories });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    // Should normalize to lowercase and remove duplicates
    expect(response.body.data.categories).toEqual(['business', 'technology']);
  });
});

/**
 * Test Suite: Preferences Persistence
 */
describe('Preferences Persistence', () => {
  test('should persist preferences across requests', async () => {
    // Update preferences
    const newPrefs = {
      categories: ['entertainment', 'sports'],
      country: 'fr',
    };

    await request(app)
      .put('/api/user/preferences')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newPrefs);

    // Fetch preferences again
    const response = await request(app)
      .get('/api/user/preferences')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.categories).toEqual(newPrefs.categories);
    expect(response.body.data.country).toBe(newPrefs.country);
  });
});
