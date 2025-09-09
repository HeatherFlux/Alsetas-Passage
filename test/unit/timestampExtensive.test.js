/**
 * Extensive timestamp format tests for maximum locale coverage
 * Tests real-world toLocaleTimeString() variations from different OS/browsers/locales
 */

import { removePrefix } from '../../chrome/src/utils/discordUtils.js';

describe('Extensive Timestamp Format Coverage', () => {
    describe('English Variants', () => {
        // US English variations
        test('US English standard formats', () => {
            expect(removePrefix('12:34:56 AM Your roll')).toBe('roll');
            expect(removePrefix('12:34:56 PM Your roll')).toBe('roll');
            expect(removePrefix('1:23:45 AM Your roll')).toBe('roll');
            expect(removePrefix('11:59:59 PM Your roll')).toBe('roll');
        });

        // UK English variations
        test('UK English with periods', () => {
            expect(removePrefix('12:34:56 a.m. Your roll')).toBe('roll');
            expect(removePrefix('12:34:56 p.m. Your roll')).toBe('roll');
            expect(removePrefix('1:23:45 a.m. Your roll')).toBe('roll');
            expect(removePrefix('11:59:59 p.m. Your roll')).toBe('roll');
        });

        // Mixed case variations
        test('Mixed case AM/PM', () => {
            expect(removePrefix('12:34:56 Am Your roll')).toBe('roll');
            expect(removePrefix('12:34:56 Pm Your roll')).toBe('roll');
            expect(removePrefix('12:34:56 aM Your roll')).toBe('roll');
            expect(removePrefix('12:34:56 pM Your roll')).toBe('roll');
        });

        // Uppercase with periods
        test('Uppercase with periods', () => {
            expect(removePrefix('12:34:56 A.M. Your roll')).toBe('roll');
            expect(removePrefix('12:34:56 P.M. Your roll')).toBe('roll');
        });
    });

    describe('24-Hour Formats', () => {
        test('Standard 24-hour format', () => {
            expect(removePrefix('00:00:00 Your roll')).toBe('roll');
            expect(removePrefix('13:45:30 Your roll')).toBe('roll');
            expect(removePrefix('23:59:59 Your roll')).toBe('roll');
        });

        test('24-hour without seconds', () => {
            expect(removePrefix('00:00 Your roll')).toBe('roll');
            expect(removePrefix('13:45 Your roll')).toBe('roll');
            expect(removePrefix('23:59 Your roll')).toBe('roll');
        });
    });

    describe('European Formats', () => {
        // German locale variations
        test('German time formats', () => {
            expect(removePrefix('12:34:56 Your roll')).toBe('roll'); // 24-hour is standard
            expect(removePrefix('13.45.30 Your roll')).toBe('roll'); // Dot separators
            expect(removePrefix('14:30:45 nachm. Your roll')).toBe('roll'); // Afternoon marker
        });

        // French locale variations
        test('French time formats', () => {
            expect(removePrefix('12:34:56 Your roll')).toBe('roll');
            expect(removePrefix('12h34m56s Your roll')).toBe('roll'); // French h/m/s format
            expect(removePrefix('12h34 Your roll')).toBe('roll'); // Without seconds
        });

        // Italian locale variations
        test('Italian time formats', () => {
            expect(removePrefix('12:34:56 Your roll')).toBe('roll');
            expect(removePrefix('12.34.56 Your roll')).toBe('roll');
        });

        // Spanish locale variations  
        test('Spanish time formats', () => {
            expect(removePrefix('12:34:56 Your roll')).toBe('roll');
            expect(removePrefix('12:34:56 a.m. Your roll')).toBe('roll');
            expect(removePrefix('12:34:56 p.m. Your roll')).toBe('roll');
        });
    });

    describe('Asian Formats', () => {
        // Japanese locale variations
        test('Japanese time formats', () => {
            expect(removePrefix('12:34:56 Your roll')).toBe('roll'); // Usually 24-hour
            expect(removePrefix('午前12:34:56 Your roll')).toBe('roll'); // AM marker
            expect(removePrefix('午後12:34:56 Your roll')).toBe('roll'); // PM marker
        });

        // Chinese locale variations
        test('Chinese time formats', () => {
            expect(removePrefix('12:34:56 Your roll')).toBe('roll');
            expect(removePrefix('上午12:34:56 Your roll')).toBe('roll'); // AM
            expect(removePrefix('下午12:34:56 Your roll')).toBe('roll'); // PM
        });

        // Korean locale variations
        test('Korean time formats', () => {
            expect(removePrefix('12:34:56 Your roll')).toBe('roll');
            expect(removePrefix('오전 12:34:56 Your roll')).toBe('roll'); // AM
            expect(removePrefix('오후 12:34:56 Your roll')).toBe('roll'); // PM
        });
    });

    describe('Special Characters and Separators', () => {
        test('Dot separators', () => {
            expect(removePrefix('12.34.56 Your roll')).toBe('roll');
            expect(removePrefix('12.34.56 AM Your roll')).toBe('roll');
            expect(removePrefix('12.34.56 PM Your roll')).toBe('roll');
        });

        test('Unicode separators', () => {
            expect(removePrefix('12：34：56 Your roll')).toBe('roll'); // Full-width colons
            expect(removePrefix('12·34·56 Your roll')).toBe('roll'); // Middle dots
        });

        test('Space variations', () => {
            expect(removePrefix('12:34:56  AM Your roll')).toBe('roll'); // Double space
            expect(removePrefix('12:34:56   PM Your roll')).toBe('roll'); // Triple space
            expect(removePrefix(' 12:34:56 AM Your roll')).toBe('roll'); // Leading space
            expect(removePrefix('12:34:56AM Your roll')).toBe('roll'); // No space before AM
        });
    });

    describe('Edge Cases', () => {
        test('Leading zeros', () => {
            expect(removePrefix('01:02:03 AM Your roll')).toBe('roll');
            expect(removePrefix('09:08:07 PM Your roll')).toBe('roll');
        });

        test('Boundary times', () => {
            expect(removePrefix('12:00:00 AM Your roll')).toBe('roll'); // Midnight
            expect(removePrefix('12:00:00 PM Your roll')).toBe('roll'); // Noon
            expect(removePrefix('11:59:59 PM Your roll')).toBe('roll'); // Last minute
        });

        test('Single digit variations', () => {
            expect(removePrefix('1:2:3 AM Your roll')).toBe('roll');
            expect(removePrefix('1:02:03 PM Your roll')).toBe('roll');
        });
    });

    describe('Browser-Specific Variations', () => {
        // Chrome variations
        test('Chrome format variations', () => {
            expect(removePrefix('12:34:56 AM Your roll')).toBe('roll');
            expect(removePrefix('12:34 AM Your roll')).toBe('roll'); // No seconds
        });

        // Firefox variations  
        test('Firefox format variations', () => {
            expect(removePrefix('12:34:56 Your roll')).toBe('roll'); // 24-hour default
            expect(removePrefix('12:34:56 AM Your roll')).toBe('roll');
        });

        // Safari variations
        test('Safari format variations', () => {
            expect(removePrefix('12:34:56 AM Your roll')).toBe('roll');
            expect(removePrefix('12:34:56 a.m. Your roll')).toBe('roll');
        });
    });

    describe('Mobile Browser Variations', () => {
        test('Mobile Chrome', () => {
            expect(removePrefix('12:34 AM Your roll')).toBe('roll'); // Often no seconds
            expect(removePrefix('12:34 PM Your roll')).toBe('roll');
        });

        test('Mobile Safari', () => {
            expect(removePrefix('12:34:56 AM Your roll')).toBe('roll');
            expect(removePrefix('12:34:56 PM Your roll')).toBe('roll');
        });
    });

    describe('Operating System Variations', () => {
        test('Windows formats', () => {
            expect(removePrefix('12:34:56 AM Your roll')).toBe('roll');
            expect(removePrefix('12:34:56 a.m. Your roll')).toBe('roll');
            expect(removePrefix('12:34:56 p.m. Your roll')).toBe('roll');
        });

        test('macOS formats', () => {
            expect(removePrefix('12:34:56 AM Your roll')).toBe('roll');
            expect(removePrefix('12:34:56 PM Your roll')).toBe('roll');
        });

        test('Linux formats', () => {
            expect(removePrefix('12:34:56 Your roll')).toBe('roll'); // Usually 24-hour
            expect(removePrefix('12:34:56 AM Your roll')).toBe('roll');
        });
    });

    describe('Hypothetical Future Formats', () => {
        // Future-proofing for potential format changes
        test('Potential new separators', () => {
            expect(removePrefix('12-34-56 AM Your roll')).toBe('roll');
            expect(removePrefix('12_34_56 PM Your roll')).toBe('roll');
        });

        test('Extended precision', () => {
            expect(removePrefix('12:34:56.789 AM Your roll')).toBe('roll');
            expect(removePrefix('12:34:56.123 Your roll')).toBe('roll');
        });
    });

    describe('Regional Variations', () => {
        // Australian/New Zealand
        test('Australian formats', () => {
            expect(removePrefix('12:34:56 am Your roll')).toBe('roll');
            expect(removePrefix('12:34:56 pm Your roll')).toBe('roll');
        });

        // Canadian
        test('Canadian formats', () => {
            expect(removePrefix('12:34:56 AM Your roll')).toBe('roll');
            expect(removePrefix('12:34:56 a.m. Your roll')).toBe('roll');
        });

        // Indian subcontinent
        test('Indian formats', () => {
            expect(removePrefix('12:34:56 AM Your roll')).toBe('roll');
            expect(removePrefix('12:34:56 Your roll')).toBe('roll');
        });

        // South African
        test('South African formats', () => {
            expect(removePrefix('12:34:56 Your roll')).toBe('roll'); // 24-hour common
            expect(removePrefix('12:34:56 AM Your roll')).toBe('roll');
        });
    });

    describe('Stress Tests', () => {
        test('Very long messages with timestamps', () => {
            const longContent = 'This is a very long roll description that goes on and on '.repeat(10) + 'with final result';
            expect(removePrefix(`12:34:56 AM Your ${longContent}`)).toBe(longContent);
        });

        test('Unicode in message content', () => {
            expect(removePrefix('12:34:56 AM Your 攻击骰子 roll')).toBe('攻击骰子 roll');
            expect(removePrefix('12:34:56 PM Your アタックロール')).toBe('アタックロール');
        });

        test('Special characters in message', () => {
            expect(removePrefix('12:34:56 AM Your "critical hit" roll')).toBe('"critical hit" roll');
            expect(removePrefix('12:34:56 PM Your roll (with advantage)')).toBe('roll (with advantage)');
        });
    });

    describe('Error Prevention', () => {
        // These should NOT be modified as they lack proper timestamp format
        test('Preserves non-timestamp text', () => {
            expect(removePrefix('Just 12:34:56 in the middle')).toBe('Just 12:34:56 in the middle');
            expect(removePrefix('Your roll without timestamp')).toBe('Your roll without timestamp');
            expect(removePrefix('12:34 incomplete timestamp Your roll')).toBe('12:34 incomplete timestamp Your roll');
        });

        test('Handles malformed timestamps gracefully', () => {
            // Our regex is intentionally permissive for maximum compatibility
            // So these "malformed" timestamps will still be processed
            expect(removePrefix('25:99:99 AM Your roll')).toBe('roll'); // Our regex accepts any digits
            expect(removePrefix('12:34:56 XM Your roll')).toBe('12:34:56 XM Your roll'); // Invalid AM/PM should be preserved
        });
    });

    describe('Real User Reports Simulation', () => {
        // Based on the conversation log, these are formats that actually broke
        test('Known problematic formats from user reports', () => {
            expect(removePrefix('2:43:15 p.m. Your roll for Perception check')).toBe('roll for Perception check');
            expect(removePrefix('10:15:30 A.M. Your Attack roll resulted in 18')).toBe('Attack roll resulted in 18');
            expect(removePrefix('14:30:45 Your Attack roll resulted in 15')).toBe('Attack roll resulted in 15'); // 24-hour
            expect(removePrefix('22:30:45 Your Critical hit for 20 damage')).toBe('Critical hit for 20 damage');
            expect(removePrefix('09:05:03 Your Attack roll resulted in 12')).toBe('Attack roll resulted in 12');
        });
    });
});