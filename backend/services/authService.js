const jwt = require('jsonwebtoken');
const supabase = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/password');
const { validateEmail, normalizeEmail } = require('../utils/email');
const { validatePassword } = require('../utils/passwordValidator');
const { createDefaultPreferences } = require('./preferencesService');

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

/**
 * Generate JWT token for user
 * @param {string} userId - User ID (UUID)
 * @param {string} email - User email
 * @returns {string} JWT token
 */
const generateToken = (userId, email) => {
  if (!userId || !email) {
    throw new Error('User ID and email are required for token generation');
  }

  const payload = {
    userId,
    email: normalizeEmail(email),
  };

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: 'HS256',
  });

  return token;
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {{userId: string, email: string}} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyToken = (token) => {
  if (!token || typeof token !== 'string') {
    throw new Error('Token must be a non-empty string');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    });

    return {
      userId: decoded.userId,
      email: decoded.email,
    };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw new Error(`Token verification failed: ${error.message}`);
  }
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.name - User full name
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @returns {Promise<{user: Object, token: string}>} User data and JWT token
 * @throws {Error} If validation fails or user already exists
 */
const register = async ({ name, email, password }) => {
  // Validate input
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    throw new Error('Name is required');
  }

  if (name.trim().length < 2) {
    throw new Error('Name must be at least 2 characters long');
  }

  if (name.trim().length > 255) {
    throw new Error('Name must be at most 255 characters long');
  }

  // Validate email format and uniqueness
  const emailValidation = await validateEmail(email);
  if (!emailValidation.isValid) {
    const errorMessage = emailValidation.errors.join(', ');
    throw new Error(errorMessage);
  }

  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    const errorMessage = passwordValidation.errors.join(', ');
    throw new Error(errorMessage);
  }

  // Normalize email
  const normalizedEmail = normalizeEmail(email);

  // Hash password
  const passwordHash = await hashPassword(password);

  // Insert user into database
  const { data: user, error } = await supabase
    .from('users')
    .insert({
      name: name.trim(),
      email: normalizedEmail,
      password_hash: passwordHash,
    })
    .select('id, email, name, created_at')
    .single();

  if (error) {
    // Handle duplicate email error
    if (error.code === '23505') {
      // PostgreSQL unique violation
      throw new Error('Email already exists');
    }
    throw new Error(`User registration failed: ${error.message}`);
  }

  // Create default preferences for new user (atomic operation)
  // If preferences creation fails, rollback by deleting the user
  try {
    await createDefaultPreferences(user.id);
  } catch (error) {
    // Rollback: Delete the user if preferences creation fails
    // eslint-disable-next-line no-console
    console.error(
      `Failed to create default preferences for user ${user.id}:`,
      error.message
    );
    // eslint-disable-next-line no-console
    console.log(`Rolling back: Deleting user ${user.id}`);

    // Delete user to maintain atomicity
    await supabase.from('users').delete().eq('id', user.id);

    // Re-throw error to fail registration
    throw new Error(
      `User registration failed: Could not create default preferences. ${error.message}`
    );
  }

  // Generate JWT token
  const token = generateToken(user.id, user.email);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    token,
  };
};

/**
 * Login user
 * @param {Object} credentials - User login credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise<{user: Object, token: string}>} User data and JWT token
 * @throws {Error} If credentials are invalid
 */
const login = async ({ email, password }) => {
  // Validate input
  if (!email || typeof email !== 'string') {
    throw new Error('Email is required');
  }

  if (!password || typeof password !== 'string') {
    throw new Error('Password is required');
  }

  // Normalize email
  const normalizedEmail = normalizeEmail(email);

  // Find user by email
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, name, password_hash')
    .eq('email', normalizedEmail)
    .single();

  if (error || !user) {
    // Don't reveal if user exists or not (security best practice)
    throw new Error('Invalid email or password');
  }

  // Compare password
  const isPasswordValid = await comparePassword(password, user.password_hash);

  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Generate JWT token
  const token = generateToken(user.id, user.email);

  // Return user data (without password_hash)
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    token,
  };
};

module.exports = {
  generateToken,
  verifyToken,
  register,
  login,
};

