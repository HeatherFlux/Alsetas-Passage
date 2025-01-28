/**
 * HTML manipulation and sanitization utilities
 */

/**
 * Formats list view details with proper line breaks
 * @param {string} details - The details to format
 * @returns {string} Formatted details
 */
export function formatListViewDetails(details) {
    return details.replace(/\n+/g, "\n> ").trim();
}

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
    for (let i = 0; i < elements.length; i++) {
        const attrs = elements[i].attributes;
        for (let j = attrs.length - 1; j >= 0; j--) {
            if (attrs[j].name.startsWith('on')) {
                elements[i].removeAttribute(attrs[j].name);
            }
        }
    }

    return tempDiv.innerHTML;
}

/**
 * Safely extracts text content from elements
 * @param {HTMLElement} tempDiv - The container element
 * @param {string} selector - CSS selector
 * @param {number} index - Index of the element
 * @param {string} defaultValue - Default value if not found
 * @returns {string} Extracted text
 */
export function safeExtract(tempDiv, selector, index = 0, defaultValue = "") {
    const elements = tempDiv.querySelectorAll(selector);
    return elements.length > index ? elements[index].innerText.trim() : defaultValue;
}

/**
 * Removes elements from HTML content
 * @param {string} contentHtml - The HTML content
 * @param {HTMLElement[]} elements - Elements to remove
 * @returns {string} Updated HTML content
 */
export function removeElementsFromHtml(contentHtml, elements) {
    elements.forEach(element => {
        contentHtml = contentHtml.replace(element.outerHTML, "");
    });
    return contentHtml;
}

/**
 * Extracts and formats traits from a detail div
 * @param {HTMLElement} detailDiv - The detail div element
 * @returns {Object} Traits and trait divs
 */
export function extractAndFormatTraits(detailDiv) {
    const traitDivs = detailDiv.querySelectorAll(".trait");
    const traits = Array.from(
        new Set(Array.from(traitDivs).map(trait => `**${trait.innerText}**`))
    ).join(" ");
    return { traits, traitDivs };
}