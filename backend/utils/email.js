const supabase = require('../config/database');

/**
 * Validate email format using regex
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email format is valid, false otherwise
 */
const isValidEmailFormat = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // RFC 5322 compliant email regex (simplified version)
  // Allows: user@example.com, user.name@example.co.uk, etc.
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Additional checks
  if (email.length > 255) {
    return false; // Email max length
  }

  return emailRegex.test(email.trim().toLowerCase());
};

/**
 * Check if email already exists in database
 * @param {string} email - Email address to check
 * @returns {Promise<boolean>} True if email exists, false otherwise
 * @throws {Error} If database query fails
 */
const isEmailUnique = async (email) => {
  if (!email || typeof email !== 'string') {
    throw new Error('Email must be a non-empty string');
  }

  // Normalize email (trim and lowercase)
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .limit(1)
      .single();

    if (error) {
      // If error is "not found" (PGRST116), email is unique
      if (error.code === 'PGRST116') {
        return true; // Email is unique (not found)
      }
      // Other errors (connection, etc.)
      throw new Error(`Database query failed: ${error.message}`);
    }

    // If data exists, email is not unique
    return false;
  } catch (error) {
    // Re-throw with context
    throw new Error(`Email uniqueness check failed: ${error.message}`);
  }
};

/**
 * Validate email and check uniqueness in one call
 * @param {string} email - Email address to validate and check
 * @returns {Promise<{isValid: boolean, isUnique: boolean, errors: string[]}>}
 * @throws {Error} If database query fails
 */
const validateEmail = async (email) => {
  const errors = [];

  // Format validation
  if (!isValidEmailFormat(email)) {
    errors.push('Invalid email format');
  }

  // Uniqueness check (only if format is valid)
  let isUnique = false;
  if (errors.length === 0) {
    try {
      isUnique = await isEmailUnique(email);
      if (!isUnique) {
        errors.push('Email already exists');
      }
    } catch (error) {
      // Database error - don't add to validation errors, throw instead
      throw error;
    }
  }

  return {
    isValid: errors.length === 0,
    isUnique,
    errors,
  };
};

/**
 * Normalize email (trim and lowercase)
 * @param {string} email - Email address to normalize
 * @returns {string} Normalized email
 */
const normalizeEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return '';
  }
  return email.trim().toLowerCase();
};

module.exports = {
  isValidEmailFormat,
  isEmailUnique,
  validateEmail,
  normalizeEmail,
};

