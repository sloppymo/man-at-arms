module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
  moduleNameMapper: {
    // If you use bare imports (aliases), map them here
    '^@/(.*)$': '<rootDir>/src/$1',
    '^\\./story-modules\\.js$': '<rootDir>/__tests__/mocks/story-modules.mock.js'
  },
  testMatch: ['**/__tests__/**/*.test.js'],
  testPathIgnorePatterns: [
    '<rootDir>/__tests__/validation/story-smoke.test.js',
    '<rootDir>/__tests__/unit/narrative-service-cjs.test.js',
    '<rootDir>/__tests__/unit/narrative-service.test.js',
    '<rootDir>/__tests__/unit/narrative-service-simple.test.js',
    '<rootDir>/__tests__/integration/narrative-flow.test.js',
    '<rootDir>/__tests__/edge-cases/robustness.test.js',
    '<rootDir>/__tests__/ui/dialog-ui.test.js'
  ]
};
