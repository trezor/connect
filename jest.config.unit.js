/*
 * Unit tests for source with coverage
 */

module.exports = {
    rootDir: './',
    moduleFileExtensions: ['js'],
    testMatch: ['**/src/js/**/*.test.(js)'],
    testPathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/src/js/plugins/ethereum',
        '<rootDir>/src/js/plugins/webextension',
    ],
    coverageDirectory: './coverage/',
    collectCoverage: true,
    modulePathIgnorePatterns: ['node_modules'],
    setupFiles: ['./tests/jest.setup.js'],
    transform: {
        '^.+\\.js$': 'babel-jest',
    },
};
