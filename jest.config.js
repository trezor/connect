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
    // collectCoverageFrom: ['**/src/js/**/*.js'],
    modulePathIgnorePatterns: ['node_modules', '_old', 'src/types', 'src/ui', 'src/utils/ws.ts'],
    // setupFiles: ['.', './tests/jest.setup.js'],
    setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js', '<rootDir>/tests/common.setup.js'],
    // globalSetup: './tests/jest.globalSetup.js',
    globalTeardown: './tests/jest.globalTeardown.js',
    transform: {
        '^.+\\.js$': 'babel-jest',
    },
};
