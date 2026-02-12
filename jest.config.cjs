module.exports = {
  testEnvironment: 'jsdom',
  transform: {},
  moduleNameMapper: {
    // If you use bare imports (aliases), map them here
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  testMatch: ['**/__tests__/**/*.test.js'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  }
};
