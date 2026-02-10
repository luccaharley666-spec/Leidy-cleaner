module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
  },
  [REDACTED_TOKEN]: ['js', 'jsx', 'json', 'node', 'ts', 'tsx'],
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: {
    '^.+\\.(css|scss|sass)$': 'identity-obj-proxy',
    '^.+\\.(jpg|jpeg|png|gif|svg|webp)$': '<rootDir>/__mocks__/fileMock.js',
    '^next\\/image$': '<rootDir>/__mocks__/next/image.js',
    '^next\\/link$': '<rootDir>/__mocks__/next/link.js'
  },
  [REDACTED_TOKEN]: ['/node_modules/', '/.next/']
}
