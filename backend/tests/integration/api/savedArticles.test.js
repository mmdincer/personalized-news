/**
 * Integration tests for Saved Articles API endpoints
 * Tests POST, GET, and DELETE /api/user/saved-articles
 */

const request = require('supertest');
const app = require('../../../server');
const supabase = require('../../../config/database');

// Test user storage
let testUser = null;
let authToken = null;
let savedArticleId = null;

/**
 * Setup: Create test user and get auth token
 */
beforeAll(async () => {
  // Register a test user
  const registerResponse = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Test Saved Articles User',
      email: `test-saved-${Date.now()}@example.com`,
      password: 'TestPass123!',
    });

  testUser = registerResponse.body.data.user;
  authToken = registerResponse.body.data.token;
});

/**
 * Cleanup: Delete test user, preferences, and saved articles
 */
afterAll(async () => {
  if (testUser) {
    // Delete saved articles
    await supabase
      .from('saved_articles')
      .delete()
      .eq('user_id', testUser.id);

    // Delete user preferences
    await supabase
      .from('user_preferences')
      .delete()
      .eq('user_id', testUser.id);

    // Delete user
    await supabase.from('users').delete().eq('id', testUser.id);
  }
}, 30000);

/**
 * Test Suite: POST /api/user/saved-articles
 */
describe('POST /api/user/saved-articles', () => {
  test('should save an article successfully', async () => {
    const articleData = {
      article_url: `https://www.theguardian.com/test/article-${Date.now()}`,
      article_title: 'Test Article Title',
      article_image_url: 'https://example.com/image.jpg',
    };

    const response = await request(app)
      .post('/api/user/saved-articles')
      .set('Authorization', `Bearer ${authToken}`)
      .send(articleData)
      .expect('Content-Type', /json/)
      .expect(201);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data).toHaveProperty('article_url', articleData.article_url);
    expect(response.body.data).toHaveProperty('article_title', articleData.article_title);
    expect(response.body.data).toHaveProperty('article_image_url', articleData.article_image_url);
    expect(response.body.data).toHaveProperty('saved_at');

    savedArticleId = response.body.data.id;
  });

  test('should fail without authentication', async () => {
    const response = await request(app)
      .post('/api/user/saved-articles')
      .send({
        article_url: 'https://example.com/article',
        article_title: 'Test',
      })
      .expect('Content-Type', /json/)
      .expect(401);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body.error).toHaveProperty('code', 'AUTH_UNAUTHORIZED');
  });

  test('should fail with missing article_url', async () => {
    const response = await request(app)
      .post('/api/user/saved-articles')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        article_title: 'Test Article',
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
  });

  test('should fail with missing article_title', async () => {
    const response = await request(app)
      .post('/api/user/saved-articles')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        article_url: 'https://example.com/article',
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
  });

  test('should handle duplicate article URL (return existing)', async () => {
    const articleData = {
      article_url: `https://www.theguardian.com/test/duplicate-${Date.now()}`,
      article_title: 'Duplicate Article',
    };

    // Save first time
    const firstResponse = await request(app)
      .post('/api/user/saved-articles')
      .set('Authorization', `Bearer ${authToken}`)
      .send(articleData)
      .expect(201);

    const firstId = firstResponse.body.data.id;

    // Try to save again (should return existing - may return 200 or 201)
    const secondResponse = await request(app)
      .post('/api/user/saved-articles')
      .set('Authorization', `Bearer ${authToken}`)
      .send(articleData);

    // Should return success (200 or 201) with same article ID
    expect([200, 201]).toContain(secondResponse.status);
    expect(secondResponse.body.data.id).toBe(firstId);
  });
});

/**
 * Test Suite: GET /api/user/saved-articles
 */
describe('GET /api/user/saved-articles', () => {
  test('should return saved articles for authenticated user', async () => {
    const response = await request(app)
      .get('/api/user/saved-articles')
      .set('Authorization', `Bearer ${authToken}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  test('should fail without authentication', async () => {
    const response = await request(app)
      .get('/api/user/saved-articles')
      .expect('Content-Type', /json/)
      .expect(401);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body.error).toHaveProperty('code', 'AUTH_UNAUTHORIZED');
  });

  test('should return empty array for user with no saved articles', async () => {
    // Create a new user with no saved articles
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Empty User',
        email: `test-empty-${Date.now()}@example.com`,
        password: 'TestPass123!',
      });

    const emptyUserToken = registerResponse.body.data.token;

    const response = await request(app)
      .get('/api/user/saved-articles')
      .set('Authorization', `Bearer ${emptyUserToken}`)
      .expect(200);

    expect(response.body.data).toEqual([]);

    // Cleanup
    await supabase
      .from('user_preferences')
      .delete()
      .eq('user_id', registerResponse.body.data.user.id);
    await supabase
      .from('users')
      .delete()
      .eq('id', registerResponse.body.data.user.id);
  });

  test('should return articles ordered by saved_at DESC', async () => {
    // Save another article
    const articleData = {
      article_url: `https://www.theguardian.com/test/latest-${Date.now()}`,
      article_title: 'Latest Article',
    };

    await request(app)
      .post('/api/user/saved-articles')
      .set('Authorization', `Bearer ${authToken}`)
      .send(articleData)
      .expect(201);

    // Get all saved articles
    const response = await request(app)
      .get('/api/user/saved-articles')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.data.length).toBeGreaterThan(1);

    // Check ordering (newest first)
    const savedDates = response.body.data.map((article) => new Date(article.saved_at));
    for (let i = 0; i < savedDates.length - 1; i++) {
      expect(savedDates[i].getTime()).toBeGreaterThanOrEqual(savedDates[i + 1].getTime());
    }
  });
});

/**
 * Test Suite: DELETE /api/user/saved-articles/:id
 */
describe('DELETE /api/user/saved-articles/:id', () => {
  test('should delete saved article successfully', async () => {
    if (!savedArticleId) {
      // Create an article to delete
      const articleData = {
        article_url: `https://www.theguardian.com/test/delete-${Date.now()}`,
        article_title: 'Article to Delete',
      };

      const saveResponse = await request(app)
        .post('/api/user/saved-articles')
        .set('Authorization', `Bearer ${authToken}`)
        .send(articleData)
        .expect(201);

      savedArticleId = saveResponse.body.data.id;
    }

    const response = await request(app)
      .delete(`/api/user/saved-articles/${savedArticleId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(204);

    expect(response.body).toEqual({});
  });

  test('should fail without authentication', async () => {
    const response = await request(app)
      .delete('/api/user/saved-articles/123e4567-e89b-12d3-a456-426614174000')
      .expect('Content-Type', /json/)
      .expect(401);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body.error).toHaveProperty('code', 'AUTH_UNAUTHORIZED');
  });

  test('should return 404 for non-existent article', async () => {
    const fakeId = '123e4567-e89b-12d3-a456-426614174000';

    const response = await request(app)
      .delete(`/api/user/saved-articles/${fakeId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect('Content-Type', /json/)
      .expect(404);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body.error).toHaveProperty('code', 'SAVED_ARTICLE_NOT_FOUND');
  });

  test('should not allow deleting other users articles', async () => {
    // Create another user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Other User',
        email: `test-other-${Date.now()}@example.com`,
        password: 'TestPass123!',
      });

    const otherUserToken = registerResponse.body.data.token;
    const otherUserId = registerResponse.body.data.user.id;

    // Create an article for the other user
    const articleData = {
      article_url: `https://www.theguardian.com/test/other-${Date.now()}`,
      article_title: 'Other User Article',
    };

    const saveResponse = await request(app)
      .post('/api/user/saved-articles')
      .set('Authorization', `Bearer ${otherUserToken}`)
      .send(articleData)
      .expect(201);

    const otherUserArticleId = saveResponse.body.data.id;

    // Try to delete other user's article with first user's token
    const response = await request(app)
      .delete(`/api/user/saved-articles/${otherUserArticleId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect('Content-Type', /json/)
      .expect(404); // Should return 404 (not found) or 403 (forbidden)

    // Cleanup other user
    await supabase
      .from('saved_articles')
      .delete()
      .eq('user_id', otherUserId);
    await supabase
      .from('user_preferences')
      .delete()
      .eq('user_id', otherUserId);
    await supabase
      .from('users')
      .delete()
      .eq('id', otherUserId);
  });
});

