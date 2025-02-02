const {
    convertHtmlToMarkdown,
    sanitizeHTML,
    formatListViewDetails,
    removeElementsFromHtml,
    extractAndFormatTraits,
    safeExtract
} = require('../../chrome/src/utils/htmlUtils.js');

describe('HTML Utilities', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    describe('convertHtmlToMarkdown', () => {
        test('converts bold tags to markdown', () => {
            const input = '<b>Bold Text</b>';
            expect(convertHtmlToMarkdown(input)).toBe('**Bold Text**');
        });

        test('converts italic tags to markdown', () => {
            const input = '<i>Italic Text</i>';
            expect(convertHtmlToMarkdown(input)).toBe('*Italic Text*');
        });

        test('converts line breaks', () => {
            const input = 'Line 1<br>Line 2<br/>Line 3';
            expect(convertHtmlToMarkdown(input)).toBe('Line 1\nLine 2\nLine 3');
        });

        test('handles nested formatting', () => {
            const input = '<b>Bold with <i>italic</i> text</b>';
            expect(convertHtmlToMarkdown(input)).toBe('**Bold with *italic* text**');
        });
    });

    describe('sanitizeHTML', () => {
        test('removes script tags', () => {
            const input = '<div>Safe content<script>alert("unsafe")</script></div>';
            const result = sanitizeHTML(input);
            expect(result).not.toContain('script');
            expect(result).toContain('Safe content');
        });

        test('removes event attributes', () => {
            const input = '<button onclick="alert()">Click me</button>';
            const result = sanitizeHTML(input);
            expect(result).not.toContain('onclick');
            expect(result).toContain('Click me');
        });

        test('preserves safe attributes', () => {
            const input = '<div class="safe" id="test">Content</div>';
            const result = sanitizeHTML(input);
            expect(result).toContain('class="safe"');
            expect(result).toContain('id="test"');
        });
    });

    describe('formatListViewDetails', () => {
        test('formats single line details', () => {
            const input = 'Single line detail';
            expect(formatListViewDetails(input)).toBe('Single line detail');
        });

        test('formats multiple line details', () => {
            const input = 'Line 1\n\nLine 2\nLine 3';
            expect(formatListViewDetails(input)).toBe('Line 1\n> Line 2\n> Line 3');
        });

        test('handles empty input', () => {
            expect(formatListViewDetails('')).toBe('');
        });
    });

    describe('removeElementsFromHtml', () => {
        test('removes specified elements', () => {
            const container = document.createElement('div');
            container.innerHTML = '<div>Keep</div><span>Remove</span>';
            const elementToRemove = container.querySelector('span');

            const result = removeElementsFromHtml(container.innerHTML, [elementToRemove]);
            expect(result).toContain('<div>Keep</div>');
            expect(result).not.toContain('<span>Remove</span>');
        });

        test('handles multiple elements', () => {
            const container = document.createElement('div');
            container.innerHTML = '<div>1</div><span>2</span><p>3</p>';
            const elementsToRemove = [
                container.querySelector('span'),
                container.querySelector('p')
            ];

            const result = removeElementsFromHtml(container.innerHTML, elementsToRemove);
            expect(result).toContain('<div>1</div>');
            expect(result).not.toContain('<span>2</span>');
            expect(result).not.toContain('<p>3</p>');
        });
    });

    describe('extractAndFormatTraits', () => {
        test('extracts and formats traits', () => {
            const container = document.createElement('div');
            container.innerHTML = `
        <div class="trait">Uncommon</div>
        <div class="trait">Critical Fusion</div>
      `;

            const { traits, traitDivs } = extractAndFormatTraits(container);
            expect(traits).toBe('**Uncommon** **Critical Fusion**');
            expect(traitDivs).toHaveLength(2);
        });

        test('handles no traits', () => {
            const container = document.createElement('div');
            const { traits, traitDivs } = extractAndFormatTraits(container);
            expect(traits).toBe('');
            expect(traitDivs).toHaveLength(0);
        });

        test('deduplicates repeated traits', () => {
            const container = document.createElement('div');
            container.innerHTML = `
        <div class="trait">Common</div>
        <div class="trait">Common</div>
      `;

            const { traits } = extractAndFormatTraits(container);
            expect(traits).toBe('**Common**');
        });
    });

    describe('safeExtract', () => {
        test('extracts text content safely', () => {
            const container = document.createElement('div');
            container.innerHTML = '<span class="test">Content</span>';

            const result = safeExtract(container, '.test');
            expect(result).toBe('Content');
        });

        test('returns default value when element not found', () => {
            const container = document.createElement('div');
            const result = safeExtract(container, '.missing', 0, 'default');
            expect(result).toBe('default');
        });

        test('handles multiple elements with index', () => {
            const container = document.createElement('div');
            container.innerHTML = `
        <span class="test">First</span>
        <span class="test">Second</span>
      `;

            const result = safeExtract(container, '.test', 1);
            expect(result).toBe('Second');
        });
    });
});