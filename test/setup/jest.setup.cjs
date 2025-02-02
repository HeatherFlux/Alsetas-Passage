require('jest-webextension-mock');
const { TextEncoder, TextDecoder } = require('util');

// Add TextEncoder/TextDecoder to global scope for JSDOM
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock browser API
global.browser = {
    runtime: {
        sendMessage: jest.fn().mockResolvedValue({ status: 'ok' }),
        getURL: jest.fn(path => `chrome-extension://mock-id/${path}`),
        onMessage: {
            addListener: jest.fn(),
            removeListener: jest.fn(),
        },
    },
    storage: {
        sync: {
            get: jest.fn().mockResolvedValue({}),
            set: jest.fn().mockResolvedValue(undefined),
        },
    },
    webNavigation: {
        onCompleted: {
            addListener: jest.fn(),
            removeListener: jest.fn(),
        },
    },
};

// Mock chrome API
global.chrome = global.browser;

// Mock MutationObserver
global.MutationObserver = class {
    constructor(callback) {
        this.callback = callback;
        this.observe = jest.fn();
        this.disconnect = jest.fn();
    }

    trigger(mutations) {
        this.callback(mutations, this);
    }
};

// Mock window.location
const mockLocation = new URL('https://pathbuilder2e.com');
Object.defineProperty(window, 'location', {
    value: mockLocation,
    writable: true,
});

// Helper to simulate DOM mutations
global.simulateMutation = (target, addedNodes = [], removedNodes = []) => {
    const observer = target._observer;
    if (observer) {
        observer.trigger([
            {
                type: 'childList',
                target,
                addedNodes,
                removedNodes,
            },
        ]);
    }
};

// Helper to create a mock element with event handling
global.createMockElement = (tagName = 'div') => {
    const element = document.createElement(tagName);
    element.addEventListener = jest.fn();
    element.removeEventListener = jest.fn();
    return element;
};

// Mock fetch API
global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    status: 200,
    statusText: 'OK',
});

// Clean up mocks after each test
afterEach(() => {
    jest.clearAllMocks();

    // Reset fetch mock
    global.fetch.mockClear();

    // Reset browser API mocks
    Object.values(browser.runtime).forEach(mock => {
        if (jest.isMockFunction(mock)) {
            mock.mockClear();
        }
    });

    // Reset console mocks
    Object.values(console).forEach(mock => {
        if (jest.isMockFunction(mock)) {
            mock.mockClear();
        }
    });
});