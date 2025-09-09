/**
 * Firefox-specific tests for background.js functions
 * Tests the Firefox extension background script functionality
 */

// Mock browser APIs for Firefox
global.browser = {
    storage: {
        sync: {
            get: jest.fn(),
        }
    },
    runtime: {
        onMessage: {
            addListener: jest.fn()
        }
    }
};

// Mock fetch globally
global.fetch = jest.fn();
global.TextEncoder = TextEncoder;

// Import the functions we need to test
// We need to require the file to get access to the functions
// Since they're not exported, we'll need to evaluate the file content
const fs = require('fs');
const path = require('path');

// Read and evaluate the Firefox background.js file
const backgroundJsPath = path.join(__dirname, '../../firefox/background.js');
const backgroundJsContent = fs.readFileSync(backgroundJsPath, 'utf8');

// Extract functions for testing by evaluating the content in a sandbox
let getStorageData, stripHTML, removePrefix, parseDiceHistory, sendToDiscord;
let handleSendToDiscord, handleLogDiceHistory, handleLogCharacterName;

// Create a context to evaluate the background script
const vm = require('vm');
const context = {
    browser: global.browser,
    fetch: global.fetch,
    console: console,
    TextEncoder: global.TextEncoder,
    characterName: 'Test Character'
};

// Evaluate the script and extract functions
vm.createContext(context);
vm.runInContext(backgroundJsContent, context);

// Extract functions from context
getStorageData = context.getStorageData;
stripHTML = context.stripHTML;
removePrefix = context.removePrefix;
parseDiceHistory = context.parseDiceHistory;
sendToDiscord = context.sendToDiscord;
handleSendToDiscord = context.handleSendToDiscord;
handleLogDiceHistory = context.handleLogDiceHistory;
handleLogCharacterName = context.handleLogCharacterName;

describe('Firefox Background Script', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        context.characterName = 'Test Character';
    });

    describe('getStorageData', () => {
        test('retrieves data from browser storage', async () => {
            const mockData = { webhooks: [{ name: 'test', url: 'http://test.com' }] };
            browser.storage.sync.get.mockResolvedValue(mockData);

            const result = await getStorageData(['webhooks']);
            
            expect(browser.storage.sync.get).toHaveBeenCalledWith(['webhooks']);
            expect(result).toEqual(mockData);
        });

        test('handles storage errors', async () => {
            const error = new Error('Storage error');
            browser.storage.sync.get.mockRejectedValue(error);

            await expect(getStorageData(['webhooks'])).rejects.toThrow('Storage error');
        });
    });

    describe('stripHTML', () => {
        test('removes HTML tags', () => {
            const input = '<b>Bold</b> and <i>italic</i> text';
            expect(stripHTML(input)).toBe(' Bold  and  italic  text');
        });

        test('handles self-closing tags', () => {
            const input = 'Text with <br/> break';
            expect(stripHTML(input)).toBe('Text with   break');
        });

        test('handles malformed HTML', () => {
            const input = 'Text with <b unclosed tag';
            expect(stripHTML(input)).toBe('Text with  ');
        });
    });

    describe('removePrefix', () => {
        test('removes US English AM timestamp', () => {
            const input = '10:45:30 AM Your Attack roll resulted in 15';
            expect(removePrefix(input)).toBe('Attack roll resulted in 15');
        });

        test('removes US English PM timestamp', () => {
            const input = '2:30:45 PM Your Damage roll resulted in 8';
            expect(removePrefix(input)).toBe('Damage roll resulted in 8');
        });

        test('removes lowercase AM/PM with periods', () => {
            const input = '10:45:30 a.m. Your Attack roll resulted in 15';
            expect(removePrefix(input)).toBe('Attack roll resulted in 15');
        });

        test('removes 24-hour format', () => {
            const input = '14:30:45 Your Attack roll resulted in 15';
            expect(removePrefix(input)).toBe('Attack roll resulted in 15');
        });

        test('handles format without seconds', () => {
            const input = '10:45 AM Your Attack roll resulted in 15';
            expect(removePrefix(input)).toBe('Attack roll resulted in 15');
        });

        test('leaves text without timestamp unchanged', () => {
            const input = 'Just a regular roll without timestamp';
            expect(removePrefix(input)).toBe('Just a regular roll without timestamp');
        });
    });

    describe('parseDiceHistory', () => {
        test('formats critical hit', () => {
            const history = '12:34:56 PM Your Critical hit 15';
            const title = 'Dagger Strike';
            context.characterName = 'Leshy';
            
            const result = parseDiceHistory(history, title);
            expect(result).toBe(`Critical Hit! **Leshy's** ${title} caused **15** damage.`);
        });

        test('formats attack roll', () => {
            const history = '12:34:56 PM Your Attack roll 18';
            const title = 'Longsword';
            context.characterName = 'Paladin';
            
            const result = parseDiceHistory(history, title);
            expect(result).toBe(`**Paladin's** ${title} attempts to hit with a **18**.`);
        });

        test('formats damage roll', () => {
            const history = '12:34:56 PM Your Damage roll 8';
            const title = 'Dagger Strike';
            context.characterName = 'Rogue';
            
            const result = parseDiceHistory(history, title);
            expect(result).toBe(`**Rogue's** ${title} caused **8** damage.`);
        });

        test('formats free roll', () => {
            const history = '12:34:56 PM Your Free roll 12 with advantage';
            const title = 'Perception';
            context.characterName = 'Ranger';
            
            const result = parseDiceHistory(history, title);
            expect(result).toBe(`**Ranger** rolls 12 with a advantage`);
        });

        test('handles unknown roll type', () => {
            const history = '12:34:56 PM Your Unknown roll 10';
            const title = 'Mystery Roll';
            context.characterName = 'Wizard';
            
            const result = parseDiceHistory(history, title);
            expect(result).toBe(`**Wizard** rolls ${title} for **roll**.`);
        });

        test('handles HTML in history', () => {
            const history = '12:34:56 PM Your <b>Attack</b> roll 15';
            const title = 'Spell';
            context.characterName = 'Sorcerer';
            
            const result = parseDiceHistory(history, title);
            expect(result).toContain('Sorcerer');
        });
    });

    describe('sendToDiscord', () => {
        const mockWebhooks = [
            { name: 'test-webhook', url: 'https://discord.com/api/webhooks/123/abc' }
        ];

        beforeEach(() => {
            browser.storage.sync.get.mockResolvedValue({
                webhooks: mockWebhooks,
                activeWebhook: 'test-webhook'
            });
        });

        test('sends message successfully', async () => {
            const mockResponse = {
                ok: true,
                status: 200
            };
            fetch.mockResolvedValue(mockResponse);

            const result = await sendToDiscord('Test message');
            
            expect(fetch).toHaveBeenCalledWith(
                'https://discord.com/api/webhooks/123/abc',
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        avatar_url: 'https://i.imgur.com/xi6Qssm.png',
                        content: 'Test message'
                    })
                })
            );
            expect(result).toBe('Message sent');
        });

        test('handles message too large error', async () => {
            const longMessage = 'a'.repeat(3000);
            
            const result = await sendToDiscord(longMessage);
            
            expect(result).toContain('Message size');
            expect(result).toContain('exceeds Discord\'s 2000 character limit');
        });

        test('handles no active webhook', async () => {
            browser.storage.sync.get.mockResolvedValue({
                webhooks: mockWebhooks,
                activeWebhook: 'non-existent'
            });

            const result = await sendToDiscord('Test message');
            
            expect(result).toBe('Error: Active webhook not found');
        });

        test('handles Discord API error', async () => {
            const mockResponse = {
                ok: false,
                status: 400,
                statusText: 'Bad Request',
                json: jest.fn().mockResolvedValue({ message: 'Invalid webhook' })
            };
            fetch.mockResolvedValue(mockResponse);

            const result = await sendToDiscord('Test message');
            
            expect(result).toContain('Error: 400 - Invalid webhook');
        });

        test('handles network error', async () => {
            fetch.mockRejectedValue(new Error('Network error'));

            const result = await sendToDiscord('Test message');
            
            expect(result).toBe('Error: Network error');
        });

        test('handles Discord API error with text response', async () => {
            const mockResponse = {
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                json: jest.fn().mockRejectedValue(new Error('Not JSON')),
                text: jest.fn().mockResolvedValue('Server error')
            };
            fetch.mockResolvedValue(mockResponse);

            const result = await sendToDiscord('Test message');
            
            expect(result).toContain('Error: 500 - Server error');
        });
    });

    describe('Handler Functions', () => {
        let mockSendResponse;

        beforeEach(() => {
            mockSendResponse = jest.fn();
        });

        describe('handleSendToDiscord', () => {
            test('handles successful message sending', async () => {
                // Mock sendToDiscord to return success
                const originalSendToDiscord = context.sendToDiscord;
                context.sendToDiscord = jest.fn().mockResolvedValue('Message sent');

                const request = { message: 'Test message' };
                await handleSendToDiscord(request, mockSendResponse);

                expect(mockSendResponse).toHaveBeenCalledWith({ status: 'ok' });
                
                // Restore original function
                context.sendToDiscord = originalSendToDiscord;
            });

            test('handles error message sending', async () => {
                const originalSendToDiscord = context.sendToDiscord;
                context.sendToDiscord = jest.fn().mockResolvedValue('Error: Failed to send');

                const request = { message: 'Test message' };
                await handleSendToDiscord(request, mockSendResponse);

                expect(mockSendResponse).toHaveBeenCalledWith(
                    expect.objectContaining({
                        status: 'error',
                        message: 'Error: Failed to send'
                    })
                );

                context.sendToDiscord = originalSendToDiscord;
            });

            test('handles thrown errors', async () => {
                const originalSendToDiscord = context.sendToDiscord;
                context.sendToDiscord = jest.fn().mockRejectedValue(new Error('Network failure'));

                const request = { message: 'Test message' };
                await handleSendToDiscord(request, mockSendResponse);

                expect(mockSendResponse).toHaveBeenCalledWith(
                    expect.objectContaining({
                        status: 'error',
                        message: 'Network failure'
                    })
                );

                context.sendToDiscord = originalSendToDiscord;
            });
        });

        describe('handleLogDiceHistory', () => {
            test('handles dice history logging', async () => {
                const originalSendToDiscord = context.sendToDiscord;
                context.sendToDiscord = jest.fn().mockResolvedValue('Message sent');

                const request = { 
                    data: 'Test Character', 
                    title: 'Attack Roll'
                };
                await handleLogDiceHistory(request, mockSendResponse);

                expect(mockSendResponse).toHaveBeenCalledWith({ status: 'ok' });
                
                context.sendToDiscord = originalSendToDiscord;
            });

            test('handles dice history error', async () => {
                const originalSendToDiscord = context.sendToDiscord;
                context.sendToDiscord = jest.fn().mockRejectedValue(new Error('Send failed'));

                const request = { 
                    data: 'Test Character', 
                    title: 'Attack Roll'
                };
                await handleLogDiceHistory(request, mockSendResponse);

                expect(mockSendResponse).toHaveBeenCalledWith(
                    expect.objectContaining({
                        status: 'error',
                        message: 'Send failed'
                    })
                );

                context.sendToDiscord = originalSendToDiscord;
            });
        });

        describe('handleLogCharacterName', () => {
            test('handles character name logging', async () => {
                const originalSendToDiscord = context.sendToDiscord;
                context.sendToDiscord = jest.fn().mockResolvedValue('Message sent');

                const request = { 
                    data: 'Test Character',
                    history: '12:34:56 PM Your Attack roll 15',
                    title: 'Sword Strike'
                };
                await handleLogCharacterName(request, mockSendResponse);

                expect(mockSendResponse).toHaveBeenCalledWith({ status: 'ok' });
                
                context.sendToDiscord = originalSendToDiscord;
            });

            test('handles character name error', async () => {
                const originalSendToDiscord = context.sendToDiscord;
                context.sendToDiscord = jest.fn().mockResolvedValue('Error: Failed');

                const request = { 
                    data: 'Test Character',
                    history: '12:34:56 PM Your Attack roll 15',
                    title: 'Sword Strike'
                };
                await handleLogCharacterName(request, mockSendResponse);

                expect(mockSendResponse).toHaveBeenCalledWith({ status: 'error' });
                
                context.sendToDiscord = originalSendToDiscord;
            });
        });
    });
});