/*
 * Integration tests
 */

module.exports = {
    rootDir: './',
    moduleFileExtensions: ['js'],
    testMatch: ['**/tests/**/*.test.js'],
    modulePathIgnorePatterns: ['node_modules', '_old', 'src/types', 'src/ui', 'src/utils/ws.ts'],
    setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js', '<rootDir>/tests/common.setup.js'],
    globalSetup: '<rootDir>/tests/jest.globalSetup.js',
    globalTeardown: '<rootDir>/tests/jest.globalTeardown.js',
    transform: {
        '^.+\\.js$': 'babel-jest',
    },
    collectCoverage: false,
    coverageDirectory: './coverage/',
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/__tests__/',
        '/__fixtures__/',
        '/src/js/env/',
        '/src/js/iframe/',
        '/src/js/popup/',
        '/src/js/storage/',
        '/src/js/types/',
        '/src/js/webusb/',
        '/src/js/plugins/',
    ],
    collectCoverageFrom: ['./src/js/**/*.{js}', '!**/node_modules/**'],
    verbose: true,
    bail: true,
    testEnvironment: 'node',
};
