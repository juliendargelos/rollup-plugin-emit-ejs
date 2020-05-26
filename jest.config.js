module.exports = {
  preset: 'ts-jest',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: ['<rootDir>/test/**/*.ts'],
  testPathIgnorePatterns: ['.+.d.ts'],
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  coverageReporters: ['text']
}
