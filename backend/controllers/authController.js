const authService = require('../services/authService');

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Call auth service
    const result = await authService.register({ name, email, password });

    // Return success response
    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        token: result.token,
      },
    });
  } catch (error) {
    // Map service errors to error codes
    let errorCode = 'SYS_INTERNAL_ERROR';
    let statusCode = 500;
    let message = error.message || 'Internal server error';

    if (error.message.includes('Email already exists') || error.message.includes('already registered')) {
      errorCode = 'AUTH_EMAIL_EXISTS';
      statusCode = 409;
      message = 'Email already exists';
    } else if (error.message.includes('Invalid email format') || error.message.includes('email format')) {
      errorCode = 'AUTH_INVALID_EMAIL';
      statusCode = 400;
      message = 'Invalid email format';
    } else if (
      error.message.includes('Password') ||
      error.message.includes('password') ||
      error.message.includes('at least')
    ) {
      errorCode = 'AUTH_WEAK_PASSWORD';
      statusCode = 400;
      message = error.message;
    } else if (error.message.includes('Name')) {
      errorCode = 'VALIDATION_ERROR';
      statusCode = 400;
      message = error.message;
    }

    // Pass error to error handling middleware
    const customError = new Error(message);
    customError.statusCode = statusCode;
    customError.errorCode = errorCode;
    return next(customError);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Call auth service
    const result = await authService.login({ email, password });

    // Return success response
    res.status(200).json({
      success: true,
      data: {
        user: result.user,
        token: result.token,
      },
    });
  } catch (error) {
    // Map service errors to error codes
    let errorCode = 'AUTH_INVALID_CREDENTIALS';
    let statusCode = 401;
    let message = 'Invalid email or password';

    if (error.message.includes('Invalid email or password')) {
      errorCode = 'AUTH_INVALID_CREDENTIALS';
      statusCode = 401;
      message = 'Invalid email or password';
    } else if (error.message.includes('Email is required')) {
      errorCode = 'VALIDATION_ERROR';
      statusCode = 400;
      message = error.message;
    } else if (error.message.includes('Password is required')) {
      errorCode = 'VALIDATION_ERROR';
      statusCode = 400;
      message = error.message;
    }

    // Pass error to error handling middleware
    const customError = new Error(message);
    customError.statusCode = statusCode;
    customError.errorCode = errorCode;
    return next(customError);
  }
};

module.exports = {
  register,
  login,
};

