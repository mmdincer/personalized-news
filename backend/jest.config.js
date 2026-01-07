module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/coverage/**',
    '!jest.config.js',
    '!server.js', // Server is tested via integration tests
  ],
  coverageThreshold: {
    global: {
      branches: 15,
      functions: 28,
      lines: 27,
      statements: 27,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 30000, // 30 seconds for integration tests
  maxWorkers: 1, // Run tests serially to avoid port conflicts
  forceExit: true, // Force exit after tests complete
  detectOpenHandles: true, // Detect open handles that prevent Jest from exiting
};

