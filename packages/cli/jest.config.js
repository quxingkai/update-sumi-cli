module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['./jest.setup.js'],
  testMatch: [ "**/__tests__/**/*.test.[jt]s?(x)"],
};
