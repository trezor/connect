/*
 * Unit tests for source with coverage
 */

module.exports = {
    rootDir: './',
    moduleFileExtensions: ['js'],
    // testMatch: ['**/src/js/**/*.test.(js)'],
    // testMatch: ['**/tests/**/*.test.(js)'],
    testMatch: ['**/tests/device/**/*.test.(js)'],
    // coverageDirectory: './coverage/',
    // collectCoverage: true,
    // collectCoverageFrom: ['**/src/**/*.js'],
    // modulePathIgnorePatterns: ['node_modules'],
    setupFiles: ['./tests/common.setup.js', './tests/jest.setup.js'],
    globalSetup: './tests/jest.globalSetup.js',
    globalTeardown: './tests/jest.globalTeardown.js',
    transform: {
        '^.+\\.js$': 'babel-jest',
    },
};
