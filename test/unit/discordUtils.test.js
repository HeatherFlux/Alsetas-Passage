import {
    removePrefix,
    parseDiceHistory,
    prepareMessage,
    createWebhookBody
} from '../../chrome/src/utils/discordUtils.js';

describe('Discord Utilities', () => {
    describe('removePrefix', () => {
        test('removes timestamp prefix', () => {
            const input = '12:34:56 PM Your roll';
            expect(removePrefix(input)).toBe('roll');
        });

        test('handles no prefix', () => {
            const input = 'Just a roll';
            expect(removePrefix(input)).toBe('Just a roll');
        });

        test('handles AM timestamp', () => {
            const input = '01:23:45 AM Your attack';
            expect(removePrefix(input)).toBe('attack');
        });
    });

    describe('parseDiceHistory', () => {
        const characterName = 'Leshy';

        test('formats critical hit', () => {
            const history = 'Critical hit 15';
            const title = 'Dagger Strike';
            const result = parseDiceHistory(history, title, characterName);
            expect(result).toBe(`Critical Hit! **${characterName}'s** ${title} caused **15** damage.`);
        });

        test('formats attack roll', () => {
            const history = 'Attack roll 18';
            const title = 'Dagger Strike';
            const result = parseDiceHistory(history, title, characterName);
            expect(result).toBe(`**${characterName}'s** ${title} attempts to hit with a **18**.`);
        });

        test('formats damage roll', () => {
            const history = 'Damage roll 8';
            const title = 'Dagger Strike';
            const result = parseDiceHistory(history, title, characterName);
            expect(result).toBe(`**${characterName}'s** ${title} caused **8** damage.`);
        });

        test('formats free roll', () => {
            const history = 'Free roll 12 with advantage';
            const title = 'Perception';
            const result = parseDiceHistory(history, title, characterName);
            expect(result).toBe(`**${characterName}** rolls 12 with advantage`);
        });

        test('handles unknown roll type', () => {
            const history = 'Unknown roll 10';
            const title = 'Mystery Roll';
            const result = parseDiceHistory(history, title, characterName);
            expect(result).toBe(`**${characterName}** rolls ${title} for **10**.`);
        });

        test('handles missing character name', () => {
            const history = 'Attack roll 15';
            const title = 'Dagger Strike';
            const result = parseDiceHistory(history, title);
            expect(result).toContain('Unknown Character');
        });
    });

    describe('prepareMessage', () => {
        test('formats message with traits', () => {
            const title = 'Dagger';
            const traits = 'Agile Finesse';
            const content = 'Attack +5';
            const result = prepareMessage(title, traits, content);
            expect(result).toBe('**Dagger**\n> **Traits:** Agile Finesse\n> Attack +5');
        });

        test('formats message without traits', () => {
            const title = 'Perception Check';
            const content = 'Roll: 15';
            const result = prepareMessage(title, '', content);
            expect(result).toBe('**Perception Check**\n> Roll: 15');
        });

        test('handles multiline content', () => {
            const title = 'Complex Action';
            const traits = 'Magical';
            const content = 'Line 1\nLine 2';
            const result = prepareMessage(title, traits, content);
            expect(result).toBe('**Complex Action**\n> **Traits:** Magical\n> Line 1\n> Line 2');
        });
    });

    describe('createWebhookBody', () => {
        test('creates webhook body with default avatar', () => {
            const message = 'Test message';
            const result = createWebhookBody(message);

            expect(result).toEqual({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    avatar_url: 'https://i.imgur.com/xi6Qssm.png',
                    content: message
                })
            });
        });

        test('creates webhook body with custom avatar', () => {
            const message = 'Test message';
            const avatarUrl = 'https://custom.avatar.url';
            const result = createWebhookBody(message, avatarUrl);

            expect(result).toEqual({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    avatar_url: avatarUrl,
                    content: message
                })
            });
        });

        test('handles special characters in message', () => {
            const message = 'Test * _ ~ message';
            const result = createWebhookBody(message);
            expect(JSON.parse(result.body).content).toBe(message);
        });
    });
});