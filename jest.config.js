/** @type {import('jest').Config} */
export default {
  // Use ES modules
  preset: null,
  testEnvironment: 'jsdom',
  
  // Configure Babel for ES modules
  transform: {
    '^.+\\.js$': ['babel-jest', { 
      presets: ['@babel/preset-env']
    }]
  },
  
  // Module file extensions
  moduleFileExtensions: ['js', 'mjs'],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
  
  // Test file patterns
  testMatch: [
    '<rootDir>/__tests__/**/*.test.js'
  ],
  
  // Coverage configuration
  collectCoverage: false, // Disable for now to focus on getting tests working
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,
  
  // Verbose output
  verbose: true,
  
  // Detect open handles
  detectOpenHandles: true
};
