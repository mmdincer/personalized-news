const passwordValidator = require('password-validator');

// Create password schema
const passwordSchema = new passwordValidator();

// Password validation rules (from SECURITY_GUIDELINES.md)
passwordSchema
  .is()
  .min(8) // Minimum 8 characters
  .is()
  .max(100) // Maximum 100 characters
  .has()
  .uppercase() // Must have uppercase letters
  .has()
  .lowercase() // Must have lowercase letters
  .has()
  .digits() // Must have digits
  .has()
  .symbols() // Must have special characters (!@#$%^&*)
  .has()
  .not()
  .spaces(); // Should not have spaces

/**
 * Validate password against security requirements
 * @param {string} password - Password to validate
 * @returns {{isValid: boolean, errors: string[]}} Validation result
 */
const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      errors: ['Password must be a non-empty string'],
    };
  }

  const errors = passwordSchema.validate(password, { details: true });

  if (errors.length === 0) {
    return {
      isValid: true,
      errors: [],
    };
  }

  // Format error messages
  const formattedErrors = errors.map((error) => {
    switch (error.validation) {
      case 'min':
        return 'Password must be at least 8 characters long';
      case 'max':
        return 'Password must be at most 100 characters long';
      case 'uppercase':
        return 'Password must contain at least one uppercase letter (A-Z)';
      case 'lowercase':
        return 'Password must contain at least one lowercase letter (a-z)';
      case 'digits':
        return 'Password must contain at least one number (0-9)';
      case 'symbols':
        return 'Password must contain at least one special character (!@#$%^&*)';
      case 'spaces':
        return 'Password must not contain spaces';
      default:
        return error.message;
    }
  });

  return {
    isValid: false,
    errors: formattedErrors,
  };
};

module.exports = {
  validatePassword,
  passwordSchema,
};

