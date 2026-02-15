module.exports = {
  testEnvironment: 'node',
  globalSetup: '<rootDir>/jest.globalSetup.js',
  setupFiles: ['<rootDir>/jest.env.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
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
  testRegex: '(/__tests__/|\\.(test|spec))\\.js$',
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/e2e/', '/coverage/'],
  verbose: true,
  maxWorkers: '50%',
};
