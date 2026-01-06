require('dotenv').config();
const express = require('express');
const cors = require('cors');

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

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
