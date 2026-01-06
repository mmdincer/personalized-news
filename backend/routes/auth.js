const express = require('express');
const authController = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validation');
const { authLimiter } = require('../middleware/security');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 * @note    Rate limited: 5 requests per 15 minutes per IP
 */
router.post('/register', authLimiter, validateRegister, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 * @note    Rate limited: 5 requests per 15 minutes per IP
 */
router.post('/login', authLimiter, validateLogin, authController.login);

module.exports = router;

