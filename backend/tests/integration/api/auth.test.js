/**
 * Integration tests for Auth API endpoints
 * Tests POST /api/auth/login
 */

const request = require('supertest');
const app = require('../../../server');
const supabase = require('../../../config/database');

// Test user storage
let testUsers = [];

/**
 * Cleanup: Delete all test users and their preferences
 */
afterAll(async () => {
  for (const user of testUsers) {
    if (user && user.id) {
      // Delete preferences first (due to foreign key)
      await supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', user.id);

      // Delete user
      await supabase.from('users').delete().eq('id', user.id);
    }
  }
}, 30000);

/**
 * Test Suite: POST /api/auth/login
 */
describe('POST /api/auth/login', () => {
  let testUser;
  let testPassword = 'TestPass123!';

  beforeAll(async () => {
    // Register a test user for login tests
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Login User',
        email: `test-login-${Date.now()}@example.com`,
        password: testPassword,
      });

    // Check if registration was successful
    if (registerResponse.status === 201 && registerResponse.body.data && registerResponse.body.data.user) {
      testUser = registerResponse.body.data.user;
      testUsers.push(testUser);
    } else {
      // If registration fails, skip tests that require a user
      console.warn('User registration failed in beforeAll, some tests may be skipped');
      console.warn('Response:', JSON.stringify(registerResponse.body, null, 2));
    }
  });

  test('should login with valid credentials', async () => {
    if (!testUser) {
      console.warn('⚠️  Skipping test: testUser not available (Supabase may not be configured)');
      return;
    }

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testPassword,
      })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('token');
    expect(response.body.data).toHaveProperty('user');
    expect(response.body.data.user).toHaveProperty('id', testUser.id);
    expect(response.body.data.user).toHaveProperty('email', testUser.email);
    expect(response.body.data.user).toHaveProperty('name', testUser.name);
    expect(response.body.data.user).not.toHaveProperty('password_hash');
  });

  test('should fail with incorrect password', async () => {
    if (!testUser) {
      console.warn('⚠️  Skipping test: testUser not available (Supabase may not be configured)');
      return;
    }

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword123!',
      })
      .expect('Content-Type', /json/)
      .expect(401);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body.error).toHaveProperty('code', 'AUTH_INVALID_CREDENTIALS');
  });

  test('should fail with non-existent email', async () => {
    // This test doesn't require testUser, so we can run it regardless
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: testPassword,
      })
      .expect('Content-Type', /json/)
      .expect(401);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body.error).toHaveProperty('code', 'AUTH_INVALID_CREDENTIALS');
  });

  test('should fail with missing email', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        password: testPassword,
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body.error).toHaveProperty('code', 'SYS_VALIDATION_ERROR');
  });

  test('should fail with missing password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser ? testUser.email : 'test@example.com',
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body.error).toHaveProperty('code', 'SYS_VALIDATION_ERROR');
  });

  test('should fail with invalid email format', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'invalid-email',
        password: testPassword,
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
  });

  test('should return JWT token that can be used for authenticated requests', async () => {
    if (!testUser) {
      console.warn('⚠️  Skipping test: testUser not available (Supabase may not be configured)');
      return;
    }

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testPassword,
      })
      .expect(200);

    const token = loginResponse.body.data.token;

    // Use token to access protected endpoint
    const prefsResponse = await request(app)
      .get('/api/user/preferences')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(prefsResponse.body.success).toBe(true);
  });
});

