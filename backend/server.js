require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Initialize Supabase client (will throw error if env vars missing)
try {
  require('./config/database');
  // eslint-disable-next-line no-console
  console.log('✓ Supabase client initialized');
} catch (error) {
  // eslint-disable-next-line no-console
  console.error('✗ Supabase initialization failed:', error.message);
  // eslint-disable-next-line no-console
  console.error('Please check your .env file and ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
}

// Initialize News Service cache cleanup (if news service is available)
try {
  const newsService = require('./services/newsService');
  if (newsService.startCacheCleanup) {
    newsService.startCacheCleanup();
    // eslint-disable-next-line no-console
    console.log('✓ News service cache cleanup started');
  }
} catch (error) {
  // News service not available yet (not an error)
  // eslint-disable-next-line no-console
  console.log('ℹ News service cache cleanup skipped (service not available)');
}

const app = express();
const PORT = process.env.PORT || 3000;

// ===========================
// CORS Configuration
// ===========================

// CORS configuration per SECURITY_GUIDELINES.md
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173', // Vite dev server default
  credentials: true, // Allow cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200, // Some legacy browsers (IE11) choke on 204
};

// In production, allow multiple origins if needed
if (process.env.NODE_ENV === 'production' && process.env.CORS_ORIGINS) {
  const allowedOrigins = process.env.CORS_ORIGINS.split(',').map((origin) =>
    origin.trim()
  );
  corsOptions.origin = (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  };
}

// ===========================
// Security Middleware
// ===========================

// Helmet for security headers (XSS protection, CSP, etc.)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for React
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'], // Allow images from any HTTPS source
        connectSrc: ["'self'"],
        fontSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false, // Disable for API server
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow cross-origin resources
  })
);

// Request size limiting
const { requestSizeLimiter, apiLimiter } = require('./middleware/security');
app.use(requestSizeLimiter);

// Body parser with size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// CORS
app.use(cors(corsOptions));

// Global rate limiting (applied to all routes)
app.use('/api', apiLimiter);

// Routes
const authRoutes = require('./routes/auth');
const preferencesRoutes = require('./routes/preferences');
const newsRoutes = require('./routes/news');

app.use('/api/auth', authRoutes);
app.use('/api/user/preferences', preferencesRoutes);
app.use('/api/news', newsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Route ${req.originalUrl} not found`,
    },
  });
});

// Error handling middleware
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on port ${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  // eslint-disable-next-line no-console
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

// Handle port already in use error
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    // eslint-disable-next-line no-console
    console.error(`Port ${PORT} is already in use. Please stop the other process or use a different port.`);
    // eslint-disable-next-line no-console
    console.error(`To find and kill the process: lsof -ti:${PORT} | xargs kill -9`);
    process.exit(1);
  } else {
    throw err;
  }
});

module.exports = app;
