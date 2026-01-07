/**
 * Integration tests for Profile API endpoints
 * Tests GET /api/user/profile and PUT /api/user/password
 */

const request = require('supertest');
const app = require('../../../server');
const supabase = require('../../../config/database');

// Test user storage
let testUser = null;
let authToken = null;
let testPassword = 'TestPass123!';

/**
 * Setup: Create test user and get auth token
 */
beforeAll(async () => {
  // Register a test user
  const registerResponse = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Test Profile User',
      email: `test-profile-${Date.now()}@example.com`,
      password: testPassword,
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
}, 30000);

/**
 * Test Suite: GET /api/user/profile
 */
describe('GET /api/user/profile', () => {
  test('should return user profile information', async () => {
    const response = await request(app)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('id', testUser.id);
    expect(response.body.data).toHaveProperty('email', testUser.email);
    expect(response.body.data).toHaveProperty('name', testUser.name);
    expect(response.body.data).toHaveProperty('createdAt');
    expect(response.body.data).toHaveProperty('updatedAt');
    expect(response.body.data).not.toHaveProperty('password_hash');
  });

  test('should fail without authentication token', async () => {
    const response = await request(app)
      .get('/api/user/profile')
      .expect('Content-Type', /json/)
      .expect(401);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body.error).toHaveProperty('code', 'AUTH_UNAUTHORIZED');
  });

  test('should fail with invalid token', async () => {
    const response = await request(app)
      .get('/api/user/profile')
      .set('Authorization', 'Bearer invalid_token')
      .expect('Content-Type', /json/)
      .expect(401);

    expect(response.body).toHaveProperty('success', false);
  });

  test('should return correct user data', async () => {
    const response = await request(app)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.data.id).toBe(testUser.id);
    expect(response.body.data.email).toBe(testUser.email);
    expect(response.body.data.name).toBe(testUser.name);
  });
});

/**
 * Test Suite: PUT /api/user/password
 */
describe('PUT /api/user/password', () => {
  test('should update password with valid current password', async () => {
    const newPassword = 'NewTestPass123!';

    const response = await request(app)
      .put('/api/user/profile/password')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        currentPassword: testPassword,
        newPassword: newPassword,
      })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'Password updated successfully');

    // Update test password for subsequent tests
    testPassword = newPassword;
  });

  test('should fail with incorrect current password', async () => {
    const response = await request(app)
      .put('/api/user/profile/password')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        currentPassword: 'WrongPassword123!',
        newPassword: 'AnotherNewPass123!',
      })
      .expect('Content-Type', /json/)
      .expect(401);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body.error).toHaveProperty('code', 'AUTH_INVALID_PASSWORD');
  });

  test('should fail with same password as current', async () => {
    const response = await request(app)
      .put('/api/user/profile/password')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        currentPassword: testPassword,
        newPassword: testPassword, // Same as current
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
  });

  test('should fail with weak new password', async () => {
    const response = await request(app)
      .put('/api/user/profile/password')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        currentPassword: testPassword,
        newPassword: 'weak', // Too short, no uppercase, no number, no special char
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
  });

  test('should fail with missing current password', async () => {
    const response = await request(app)
      .put('/api/user/profile/password')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        newPassword: 'NewTestPass123!',
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body.error).toHaveProperty('code', 'SYS_VALIDATION_ERROR');
  });

  test('should fail with missing new password', async () => {
    const response = await request(app)
      .put('/api/user/profile/password')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        currentPassword: testPassword,
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body.error).toHaveProperty('code', 'SYS_VALIDATION_ERROR');
  });

  test('should fail without authentication', async () => {
    const response = await request(app)
      .put('/api/user/profile/password')
      .send({
        currentPassword: testPassword,
        newPassword: 'NewTestPass123!',
      })
      .expect('Content-Type', /json/)
      .expect(401);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body.error).toHaveProperty('code', 'AUTH_UNAUTHORIZED');
  });

  test('should allow login with new password after update', async () => {
    // First update password
    const newPassword = 'FinalTestPass123!';
    await request(app)
      .put('/api/user/profile/password')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        currentPassword: testPassword,
        newPassword: newPassword,
      })
      .expect(200);

    // Try to login with new password
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: newPassword,
      })
      .expect(200);

    expect(loginResponse.body).toHaveProperty('success', true);
    expect(loginResponse.body.data).toHaveProperty('token');

    // Update authToken for cleanup
    authToken = loginResponse.body.data.token;
    testPassword = newPassword;
  });
});

