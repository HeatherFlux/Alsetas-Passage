/**
 * Utility functions for HTML manipulation and sanitization
 */

/**
 * Converts HTML content to Discord-compatible markdown
 * @param {string} htmlContent - The HTML content to convert
 * @returns {string} Markdown formatted text
 */
export function convertHtmlToMarkdown(htmlContent) {
    let markdown = htmlContent;
    markdown = markdown
        .replace(/<b>(.*?)<\/b>/g, "**$1**")
        .replace(/<i>(.*?)<\/i>/g, "*$1*")
        .replace(/<br\s*\/?>/g, "\n")
        .replace(/<[^>]+>/g, "\n");
    return markdown.trim();
}

/**
 * Sanitizes HTML content by removing scripts and event attributes
 * @param {string} str - The HTML string to sanitize
 * @returns {string} Sanitized HTML
 */
export function sanitizeHTML(str) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = str;

    // Remove script elements
    const scripts = tempDiv.getElementsByTagName('script');
    while (scripts.length > 0) {
        scripts[0].parentNode.removeChild(scripts[0]);
    }

    // Remove event attributes
    const elements = tempDiv.getElementsByTagName('*');
    Array.from(elements).forEach(element => {
        Array.from(element.attributes).forEach(attr => {
            if (attr.name.startsWith('on')) {
                element.removeAttribute(attr.name);
            }
        });
    });

    return tempDiv.innerHTML;
}

/**
 * Formats list view details by adding proper line breaks and indentation
 * @param {string} details - The details to format
 * @returns {string} Formatted details
 */
export function formatListViewDetails(details) {
    return details.replace(/\n+/g, "\n> ").trim();
}

/**
 * Strips all HTML tags from a string
 * @param {string} html - The HTML string to strip
 * @returns {string} Plain text without HTML tags
 */
export function stripHTML(html) {
    return html.replace(/<\/?[^>]+(>|$)/g, " ");
}

/**
 * Safely extracts text content from HTML elements
 * @param {HTMLElement} tempDiv - The container element
 * @param {string} selector - CSS selector
 * @param {number} index - Index of the element to extract from
 * @param {string} defaultValue - Default value if element not found
 * @returns {string} Extracted text content
 */
export function safeExtract(tempDiv, selector, index = 0, defaultValue = "") {
    const elements = tempDiv.querySelectorAll(selector);
    return elements.length > index ? elements[index].innerText.trim() : defaultValue;
}