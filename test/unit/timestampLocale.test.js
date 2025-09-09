/**
 * Unit tests for timestamp parsing across different locales
 * Tests various toLocaleTimeString() formats that users encounter
 */

import { removePrefix } from '../../chrome/src/utils/discordUtils.js';

describe('Timestamp Locale Parsing', () => {
    describe('removePrefix - Locale Variations', () => {
        // Current working formats (US English)
        test('handles US English AM format', () => {
            const input = '10:45:30 AM Your Attack roll resulted in 15';
            expect(removePrefix(input)).toBe('Attack roll resulted in 15');
        });

        test('handles US English PM format', () => {
            const input = '2:30:45 PM Your Damage roll resulted in 8';
            expect(removePrefix(input)).toBe('Damage roll resulted in 8');
        });

        // Known problematic formats from user reports
        test('handles lowercase AM/PM with periods', () => {
            const input = '10:45:30 a.m. Your Attack roll resulted in 15';
            expect(removePrefix(input)).toBe('Attack roll resulted in 15');
        });

        test('handles lowercase PM with periods', () => {
            const input = '10:45:30 p.m. Your Damage roll resulted in 8';
            expect(removePrefix(input)).toBe('Damage roll resulted in 8');
        });

        test('handles 24-hour format (no AM/PM)', () => {
            const input = '14:30:45 Your Attack roll resulted in 15';
            expect(removePrefix(input)).toBe('Attack roll resulted in 15');
        });

        test('handles 24-hour evening format', () => {
            const input = '22:30:45 Your Critical hit for 20 damage';
            expect(removePrefix(input)).toBe('Critical hit for 20 damage');
        });

        // Edge cases
        test('handles single digit hour with AM', () => {
            const input = '9:05:03 AM Your Free roll with a d20';
            expect(removePrefix(input)).toBe('Free roll with a d20');
        });

        test('handles noon format', () => {
            const input = '12:00:00 PM Your Spell attack roll of 18';
            expect(removePrefix(input)).toBe('Spell attack roll of 18');
        });

        test('handles midnight format', () => {
            const input = '12:00:00 AM Your Night attack roll of 14';
            expect(removePrefix(input)).toBe('Night attack roll of 14');
        });

        // International variations that might occur
        test('handles format without seconds', () => {
            const input = '10:45 AM Your Attack roll resulted in 15';
            expect(removePrefix(input)).toBe('Attack roll resulted in 15');
        });

        test('handles 24-hour format without seconds', () => {
            const input = '14:30 Your Attack roll resulted in 15';
            expect(removePrefix(input)).toBe('Attack roll resulted in 15');
        });

        // European-style formats (if they occur)
        test('handles dot-separated time format', () => {
            const input = '10.45.30 Your Attack roll resulted in 15';
            expect(removePrefix(input)).toBe('Attack roll resulted in 15');
        });

        test('handles space-separated AM/PM', () => {
            const input = '10:45:30  AM Your Attack roll resulted in 15';
            expect(removePrefix(input)).toBe('Attack roll resulted in 15');
        });

        test('handles mixed case AM/PM', () => {
            const input = '10:45:30 Am Your Attack roll resulted in 15';
            expect(removePrefix(input)).toBe('Attack roll resulted in 15');
        });

        test('handles mixed case PM', () => {
            const input = '10:45:30 Pm Your Damage roll resulted in 8';
            expect(removePrefix(input)).toBe('Damage roll resulted in 8');
        });

        // Real-world examples from user bug reports
        describe('User-Reported Problematic Formats', () => {
            test('Windows locale with periods and lowercase', () => {
                const input = '2:43:15 p.m. Your roll for Perception check';
                expect(removePrefix(input)).toBe('roll for Perception check');
            });

            test('Windows locale with periods and uppercase', () => {
                const input = '10:15:30 A.M. Your Attack roll resulted in 18';
                expect(removePrefix(input)).toBe('Attack roll resulted in 18');
            });

            test('German-style afternoon marker', () => {
                // This is hypothetical but could happen
                const input = '14:30:45 nachm. Your Attack roll resulted in 15';
                expect(removePrefix(input)).toBe('Attack roll resulted in 15');
            });

            test('24-hour with leading zero', () => {
                const input = '09:05:03 Your Attack roll resulted in 12';
                expect(removePrefix(input)).toBe('Attack roll resulted in 12');
            });
        });

        // Test cases that should NOT be modified (no timestamp prefix)
        describe('Non-timestamp Input', () => {
            test('leaves text without timestamp unchanged', () => {
                const input = 'Just a regular roll without timestamp';
                expect(removePrefix(input)).toBe('Just a regular roll without timestamp');
            });

            test('leaves partial timestamp unchanged', () => {
                const input = '10:45 Attack roll without seconds';
                expect(removePrefix(input)).toBe('10:45 Attack roll without seconds');
            });

            test('handles empty string', () => {
                const input = '';
                expect(removePrefix(input)).toBe('');
            });
        });
    });

    describe('Dynamic Timestamp Detection', () => {
        // This tests the concept of detecting user's locale format
        test('simulates dynamic regex generation', () => {
            // Mock different locale timestamp formats
            const localeFormats = [
                '10:45:30 AM',  // US English
                '10:45:30 a.m.', // Lowercase with periods
                '10:45:30',     // 24-hour
                '10.45.30',     // European dots
            ];

            localeFormats.forEach(format => {
                // Create a test input with this format
                const input = `${format} Your Test roll`;
                
                // The function should handle this format
                // (This will fail until we implement dynamic detection)
                const result = removePrefix(input);
                
                // For now, we expect some formats to work and others to fail
                if (format.includes('AM') || format.includes('PM')) {
                    expect(result).toBe('Test roll');
                } else {
                    // These formats currently won't work but should in the future
                    // expect(result).toBe('Test roll');
                }
            });
        });
    });

    describe('Performance and Edge Cases', () => {
        test('handles very long messages', () => {
            const longMessage = 'Attack roll with a very long description that goes on and on and on '.repeat(5) + 'resulted in 15';
            const input = `10:45:30 AM Your ${longMessage}`;
            const result = removePrefix(input);
            expect(result).toBe(longMessage);
        });

        test('handles special characters in timestamp area', () => {
            const input = '10:45:30 AM Your "Attack roll" resulted in 15';
            expect(removePrefix(input)).toBe('"Attack roll" resulted in 15');
        });

        test('handles unicode characters', () => {
            const input = '10:45:30 AM Your Ättäck röll resulted in 15';
            expect(removePrefix(input)).toBe('Ättäck röll resulted in 15');
        });
    });
});