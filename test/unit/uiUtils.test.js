const {
    showToast,
    createExportButton,
    hasEventListener,
    registerEventListener,
    eventListenerRegistry,
    injectCSS,
    setupLogging
} = require('../../chrome/src/utils/uiUtils.js');

describe('UI Utilities', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        document.head.innerHTML = '';
        jest.useFakeTimers();
    });

    afterEach(() => {
        document.body.innerHTML = '';
        document.head.innerHTML = '';
        jest.clearAllMocks();
        jest.useRealTimers();
    });

    describe('showToast', () => {
        test('creates toast container if not exists', () => {
            showToast('Test message');
            const container = document.getElementById('alseta-toast-container');
            expect(container).toBeTruthy();
        });

        test('adds toast with message', () => {
            showToast('Test message');
            const toast = document.querySelector('.alseta-toast');
            expect(toast.textContent).toContain('Test message');
        });

        test('adds close button to toast', () => {
            showToast('Test message');
            const closeButton = document.querySelector('.close-btn');
            expect(closeButton).toBeTruthy();
            expect(closeButton.textContent).toBe('×');
        });

        test('removes toast on close button click', () => {
            showToast('Test message');
            const closeButton = document.querySelector('.close-btn');
            closeButton.click();

            jest.advanceTimersByTime(500);
            const toast = document.querySelector('.alseta-toast');
            expect(toast).toBeFalsy();
        });

        test('auto-removes toast after duration', () => {
            const duration = 1000;
            showToast('Test message', duration);

            jest.advanceTimersByTime(duration + 500);
            const toast = document.querySelector('.alseta-toast');
            expect(toast).toBeFalsy();
        });
    });

    describe('createExportButton', () => {
        test('creates button with correct text', () => {
            const button = createExportButton();
            expect(button.textContent).toBe('Send To Discord');
        });

        test('applies correct class', () => {
            const button = createExportButton();
            expect(button.className).toBe('discord-export-button');
        });

        test('applies correct styles', () => {
            const button = createExportButton();
            expect(button.style.backgroundColor).toBe('rgb(76, 175, 80)');
            expect(button.style.color).toBe('white');
            expect(button.style.borderRadius).toBe('4px');
            expect(button.style.cursor).toBe('pointer');
        });
    });

    describe('Event Listener Registry', () => {
        test('registers event listener', () => {
            const element = document.createElement('button');
            registerEventListener(element, 'click');
            expect(hasEventListener(element, 'click')).toBe(true);
        });

        test('detects existing listener', () => {
            const element = document.createElement('button');
            registerEventListener(element, 'click');
            expect(hasEventListener(element, 'click')).toBe(true);
            expect(hasEventListener(element, 'mouseover')).toBe(false);
        });

        test('handles multiple listeners on same element', () => {
            const element = document.createElement('button');
            registerEventListener(element, 'click');
            registerEventListener(element, 'mouseover');
            expect(hasEventListener(element, 'click')).toBe(true);
            expect(hasEventListener(element, 'mouseover')).toBe(true);
        });

        test('maintains separate registries for different elements', () => {
            const button1 = document.createElement('button');
            const button2 = document.createElement('button');

            registerEventListener(button1, 'click');
            expect(hasEventListener(button1, 'click')).toBe(true);
            expect(hasEventListener(button2, 'click')).toBe(false);
        });
    });

    describe('injectCSS', () => {
        test('injects CSS link element', () => {
            const cssPath = 'test.css';
            injectCSS(cssPath);

            const linkElement = document.querySelector('link[rel="stylesheet"]');
            expect(linkElement).toBeTruthy();
            expect(linkElement.href).toContain(cssPath);
        });

        test('uses browser.runtime.getURL for path', () => {
            const cssPath = 'test.css';
            const mockUrl = 'chrome-extension://id/test.css';
            global.browser = {
                runtime: {
                    getURL: jest.fn().mockReturnValue(mockUrl)
                }
            };

            injectCSS(cssPath);
            const linkElement = document.querySelector('link[rel="stylesheet"]');
            expect(linkElement.href).toBe(mockUrl);
            expect(browser.runtime.getURL).toHaveBeenCalledWith(cssPath);

            delete global.browser;
        });
    });

    describe('setupLogging', () => {
        test('enhances console.log with prefix', () => {
            const originalLog = console.log;
            const mockLog = jest.fn();
            console.log = mockLog;

            setupLogging();
            console.log('test');

            expect(mockLog).toHaveBeenCalledWith("Alseta's Passage Log:", ': ', 'test');
            console.log = originalLog;
        });

        test('preserves multiple arguments', () => {
            const originalLog = console.log;
            const mockLog = jest.fn();
            console.log = mockLog;

            setupLogging();
            console.log('test', 123, { key: 'value' });

            expect(mockLog).toHaveBeenCalledWith(
                "Alseta's Passage Log:",
                ': ',
                'test',
                123,
                { key: 'value' }
            );
            console.log = originalLog;
        });
    });
});