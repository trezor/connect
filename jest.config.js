/*
 * Unit tests for source with coverage
 */

module.exports = {
    rootDir: './',
    moduleFileExtensions: ['js'],
    testMatch: ['**/src/js/**/*.test.(js)'],
    // coverageDirectory: './coverage/',
    // collectCoverage: true,
    // collectCoverageFrom: ['**/src/**/*.js'],
    // modulePathIgnorePatterns: ['node_modules'],
    setupFiles: ['./tests/jest.setup.js'],
    transform: {
        '^.+\\.js$': 'babel-jest',
    },
};
