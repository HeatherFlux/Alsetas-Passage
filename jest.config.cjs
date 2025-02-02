module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/test/setup/jest.setup.cjs'],
    transform: {
        '^.+\\.(js|jsx)$': ['babel-jest', { configFile: './babel.config.cjs' }]
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1'
    },
    collectCoverageFrom: [
        'chrome/src/**/*.js',
        'firefox/src/**/*.js'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov'],
    testPathIgnorePatterns: ['/node_modules/', '/build/'],
    globals: {
        'ts-jest': {
            useESM: true,
        },
    },
    fakeTimers: {
        enableGlobally: true,
        now: 1234567890,
        timerLimit: 1000
    },
    testMatch: [
        '<rootDir>/test/**/*.test.js'
    ],
    moduleFileExtensions: ['js', 'json', 'cjs'],
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
    verbose: true,
    transformIgnorePatterns: [
        'node_modules/(?!(module-that-needs-to-be-transformed)/)'
    ],
    moduleDirectories: ['node_modules', 'src'],
    testEnvironmentOptions: {
        url: 'http://localhost/'
    },
    injectGlobals: true,
    testTimeout: 10000,
    setupFiles: ['<rootDir>/node_modules/jest-webextension-mock']
};