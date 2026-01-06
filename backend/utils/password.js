const bcrypt = require('bcrypt');

// Bcrypt salt rounds (cost factor)
const SALT_ROUNDS = 10;

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 * @throws {Error} If password hashing fails
 */
const hashPassword = async (password) => {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    return hashedPassword;
  } catch (error) {
    throw new Error(`Password hashing failed: ${error.message}`);
  }
};

/**
 * Compare a plain text password with a hashed password
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Bcrypt hashed password
 * @returns {Promise<boolean>} True if passwords match, false otherwise
 * @throws {Error} If password comparison fails
 */
const comparePassword = async (password, hashedPassword) => {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }

  if (!hashedPassword || typeof hashedPassword !== 'string') {
    throw new Error('Hashed password must be a non-empty string');
  }

  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    throw new Error(`Password comparison failed: ${error.message}`);
  }
};

module.exports = {
  hashPassword,
  comparePassword,
  SALT_ROUNDS,
};


