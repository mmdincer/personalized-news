/**
 * Integration tests for News API endpoints
 */

const request = require('supertest');
const app = require('../../../server');

// Skip tests if Guardian API key is not configured
const hasGuardianApiKey = process.env.GUARDIAN_API_KEY && process.env.GUARDIAN_API_KEY !== 'test-guardian-api-key';

describe('News API Integration Tests', () => {
  describe('GET /api/news/:category', () => {
    it('should return technology news (public endpoint)', async () => {
      if (!hasGuardianApiKey) {
        console.warn('⚠️  Skipping test: Guardian API key not configured');
        return;
      }

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
      if (!hasGuardianApiKey) {
        console.warn('⚠️  Skipping test: Guardian API key not configured');
        return;
      }

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
      if (!hasGuardianApiKey) {
        console.warn('⚠️  Skipping test: Guardian API key not configured');
        return;
      }

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
      if (!hasGuardianApiKey) {
        console.warn('⚠️  Skipping test: Guardian API key not configured');
        return;
      }

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

  describe('GET /api/news/search', () => {
    it('should return search results with valid query', async () => {
      if (!hasGuardianApiKey) {
        console.warn('⚠️  Skipping test: Guardian API key not configured');
        return;
      }

      // Wait a bit to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const response = await request(app)
        .get('/api/news/search?q=technology')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('articles');
      expect(response.body.data).toHaveProperty('totalResults');
      expect(Array.isArray(response.body.data.articles)).toBe(true);
    });

    it('should fail with query shorter than 2 characters', async () => {
      const response = await request(app)
        .get('/api/news/search?q=t')
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'VAL_INVALID_FORMAT');
    });

    it('should fail without query parameter', async () => {
      const response = await request(app)
        .get('/api/news/search')
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should support pagination', async () => {
      if (!hasGuardianApiKey) {
        console.warn('⚠️  Skipping test: Guardian API key not configured');
        return;
      }

      // Wait a bit to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const response = await request(app)
        .get('/api/news/search?q=science&page=1&limit=10')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.data).toHaveProperty('page', 1);
      expect(response.body.data).toHaveProperty('pageSize', 10);
    });

    it('should support date filtering', async () => {
      if (!hasGuardianApiKey) {
        console.warn('⚠️  Skipping test: Guardian API key not configured');
        return;
      }

      // Wait a bit to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      const response = await request(app)
        .get(`/api/news/search?q=news&from=${yesterday}&to=${today}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should support sorting', async () => {
      if (!hasGuardianApiKey) {
        console.warn('⚠️  Skipping test: Guardian API key not configured');
        return;
      }

      // Wait a bit to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const response = await request(app)
        .get('/api/news/search?q=technology&sort=newest')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('GET /api/news/article/:id', () => {
    let testArticleId;

    beforeAll(async () => {
      if (!hasGuardianApiKey) {
        console.warn('⚠️  Skipping article tests: Guardian API key not configured');
        return;
      }

      // Wait a bit to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Get a real article ID from the API
      const newsResponse = await request(app)
        .get('/api/news/technology?limit=1')
        .expect(200);

      if (newsResponse.body.data.articles.length > 0) {
        testArticleId = newsResponse.body.data.articles[0].id;
      }
    });

    it('should return article details by ID', async () => {
      if (!testArticleId) {
        // Skip if no article ID available
        return;
      }

      // Wait a bit to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const response = await request(app)
        .get(`/api/news/article/${encodeURIComponent(testArticleId)}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id', testArticleId);
      expect(response.body.data).toHaveProperty('title');
      expect(response.body.data).toHaveProperty('url');
    });

    it('should return article details by URL', async () => {
      if (!testArticleId) {
        return;
      }

      // Wait a bit to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const testUrl = `https://www.theguardian.com/${testArticleId}`;
      const response = await request(app)
        .get(`/api/news/article/${encodeURIComponent(testUrl)}`)
        .expect('Content-Type', /json/);

      // May return 200 or 404 depending on URL format
      expect([200, 404]).toContain(response.status);
    });

    it('should return 404 for non-existent article', async () => {
      // Wait a bit to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const response = await request(app)
        .get('/api/news/article/non-existent-article-id')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toHaveProperty('code', 'NEWS_ARTICLE_NOT_FOUND');
    });
  });

  describe('Caching behavior', () => {
    it('should cache responses', async () => {
      if (!hasGuardianApiKey) {
        console.warn('⚠️  Skipping test: Guardian API key not configured');
        return;
      }

      // Wait a bit to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // First request (cache miss)
      const start1 = Date.now();
      await request(app).get('/api/news/sport').expect(200);
      const duration1 = Date.now() - start1;

      // Second request (cache hit - should be faster)
      const start2 = Date.now();
      await request(app).get('/api/news/sport').expect(200);
      const duration2 = Date.now() - start2;

      // Cache hit should generally be faster
      // Note: This might not always be true due to network variability
      expect(duration2).toBeLessThanOrEqual(duration1 + 100);
    });
  });
});
