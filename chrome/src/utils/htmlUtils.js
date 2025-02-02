/**
 * Utility functions for HTML manipulation
 */

/**
 * Convert HTML to markdown format
 * @param {string} html - HTML content to convert
 * @returns {string} Markdown formatted text
 */
function convertHtmlToMarkdown(html) {
    return html
        .replace(/<b>(.*?)<\/b>/g, '**$1**')
        .replace(/<i>(.*?)<\/i>/g, '*$1*')
        .replace(/<br\s*\/?>/g, '\n');
}

/**
 * Sanitize HTML content
 * @param {string} html - HTML content to sanitize
 * @returns {string} Sanitized HTML
 */
function sanitizeHTML(html) {
    const div = document.createElement('div');
    div.innerHTML = html;

    // Remove script tags
    const scripts = div.getElementsByTagName('script');
    while (scripts[0]) {
        scripts[0].parentNode.removeChild(scripts[0]);
    }

    // Remove event attributes
    const elements = div.getElementsByTagName('*');
    for (let i = 0; i < elements.length; i++) {
        const attrs = elements[i].attributes;
        for (let j = attrs.length - 1; j >= 0; j--) {
            if (attrs[j].name.startsWith('on')) {
                elements[i].removeAttribute(attrs[j].name);
            }
        }
    }

    return div.innerHTML;
}

/**
 * Format list view details
 * @param {string} details - Details to format
 * @returns {string} Formatted details
 */
function formatListViewDetails(details) {
    if (!details) return '';
    const lines = details.split('\n').filter(line => line.trim());
    if (lines.length <= 1) return details;

    return lines[0] + '\n' + lines.slice(1)
        .map(line => `> ${line}`)
        .join('\n');
}

/**
 * Remove elements from HTML content
 * @param {string} html - HTML content
 * @param {HTMLElement[]} elements - Elements to remove
 * @returns {string} HTML with elements removed
 */
function removeElementsFromHtml(html, elements) {
    const div = document.createElement('div');
    div.innerHTML = html;

    elements.forEach(element => {
        const selector = element.tagName.toLowerCase() +
            Array.from(element.classList)
                .map(c => '.' + c)
                .join('');
        const match = div.querySelector(selector);
        if (match) {
            match.parentNode.removeChild(match);
        }
    });

    return div.innerHTML;
}

/**
 * Extract and format traits from container
 * @param {HTMLElement} container - Container element
 * @returns {Object} Traits and trait divs
 */
function extractAndFormatTraits(container) {
    const traitDivs = Array.from(container.querySelectorAll('.trait'));
    const uniqueTraits = [...new Set(traitDivs.map(div => div.textContent.trim()))];
    const traits = uniqueTraits.map(trait => `**${trait}**`).join(' ');
    return { traits, traitDivs };
}

/**
 * Safely extract text content from element
 * @param {HTMLElement} container - Container element
 * @param {string} selector - CSS selector
 * @param {number} index - Element index
 * @param {string} defaultValue - Default value
 * @returns {string} Extracted text or default value
 */
function safeExtract(container, selector, index = 0, defaultValue = '') {
    const elements = container.querySelectorAll(selector);
    return elements.length > index ? elements[index].textContent.trim() : defaultValue;
}

module.exports = {
    convertHtmlToMarkdown,
    sanitizeHTML,
    formatListViewDetails,
    removeElementsFromHtml,
    extractAndFormatTraits,
    safeExtract
};