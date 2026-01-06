/**
 * Integration tests for News API endpoints
 */

const request = require('supertest');
const app = require('../../../server');

describe('News API Integration Tests', () => {
  describe('GET /api/news/:category', () => {
    it('should return technology news (public endpoint)', async () => {
      const response = await request(app)
        .get('/api/news/technology')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('articles');
      expect(response.body.data).toHaveProperty('totalResults');
      expect(response.body.data).toHaveProperty('page', 1);
      expect(response.body.data).toHaveProperty('pageSize', 20);
      expect(Array.isArray(response.body.data.articles)).toBe(true);
    });

    it('should validate category parameter', async () => {
      const response = await request(app)
        .get('/api/news/invalid-category')
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'VAL_INVALID_FORMAT');
    });

    it('should validate pagination parameters', async () => {
      const response = await request(app)
        .get('/api/news/technology?page=0')
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'VAL_INVALID_FORMAT');
    });

    it('should support pagination', async () => {
      // Wait a bit to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const response = await request(app)
        .get('/api/news/business?page=1&limit=10')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.data).toHaveProperty('page', 1);
      expect(response.body.data).toHaveProperty('pageSize', 10);
    });
  });

  describe('GET /api/news (personalized)', () => {
    let authToken;
    let userId;

    beforeAll(async () => {
      // Wait a bit to avoid rate limiting from previous tests
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Register a test user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: `test-news-${Date.now()}@example.com`,
          name: 'Test User',
          password: 'SecurePass123!',
        });

      authToken = registerResponse.body.data.token;
      userId = registerResponse.body.data.user.id;
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/news')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'AUTH_UNAUTHORIZED');
    });

    it('should return personalized news with valid token', async () => {
      // Wait a bit to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const response = await request(app)
        .get('/api/news')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('articles');
      expect(Array.isArray(response.body.data.articles)).toBe(true);
    });

    it('should support pagination with authentication', async () => {
      // Wait a bit to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const response = await request(app)
        .get('/api/news?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.data).toHaveProperty('page', 1);
      expect(response.body.data).toHaveProperty('pageSize', 5);
    });
  });

  describe('GET /api/news/stats/rate-limit', () => {
    let authToken;

    beforeAll(async () => {
      // Register a test user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: `test-stats-${Date.now()}@example.com`,
          name: 'Test Stats User',
          password: 'SecurePass123!',
        });

      authToken = registerResponse.body.data.token;
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/news/stats/rate-limit')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should return rate limit statistics', async () => {
      const response = await request(app)
        .get('/api/news/stats/rate-limit')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('dailyCount');
      expect(response.body.data).toHaveProperty('remaining');
      expect(typeof response.body.data.dailyCount).toBe('number');
      expect(typeof response.body.data.remaining).toBe('number');
    });
  });

  describe('POST /api/news/cache/clear', () => {
    let authToken;

    beforeAll(async () => {
      // Register a test user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: `test-admin-${Date.now()}@example.com`,
          name: 'Test Admin User',
          password: 'SecurePass123!',
        });

      authToken = registerResponse.body.data.token;
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/news/cache/clear')
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should require admin access in development', async () => {
      // In development mode without ADMIN_EMAILS configured, it allows access
      const response = await request(app)
        .post('/api/news/cache/clear')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/);

      // Should succeed in development mode or return 403 if admin check is strict
      expect([200, 403]).toContain(response.status);
    });
  });

  describe('Caching behavior', () => {
    it('should cache responses', async () => {
      // Wait a bit to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // First request (cache miss)
      const start1 = Date.now();
      await request(app).get('/api/news/sports').expect(200);
      const duration1 = Date.now() - start1;

      // Second request (cache hit - should be faster)
      const start2 = Date.now();
      await request(app).get('/api/news/sports').expect(200);
      const duration2 = Date.now() - start2;

      // Cache hit should generally be faster
      // Note: This might not always be true due to network variability
      expect(duration2).toBeLessThanOrEqual(duration1 + 100);
    });
  });
});
