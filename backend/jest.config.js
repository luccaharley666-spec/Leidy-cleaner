module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/jest.env.js'],
  moduleNameMapper: {
    '^newrelic$': '<rootDir>/__mocks__/newrelic.js'
  },
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/index.js',
  ],
  coverageDirectory: 'coverage',
  // Threshold disabled initially; can be enabled after more tests are added
  // coverageThreshold: {
  //   global: {
  //     branches: 30,
  //     functions: 30,
  //     lines: 30,
  //     statements: 30,
  //   },
  // },
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  verbose: true,
};
