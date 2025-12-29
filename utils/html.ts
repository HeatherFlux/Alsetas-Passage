/**
 * HTML manipulation utilities
 */

/**
 * Convert HTML to Discord-compatible markdown
 */
export function convertHtmlToMarkdown(html: string): string {
  return html
    .replace(/<b>(.*?)<\/b>/g, '**$1**')
    .replace(/<i>(.*?)<\/i>/g, '*$1*')
    .replace(/<br\s*\/?>/g, '\n');
}

/**
 * Sanitize HTML content by removing scripts and event handlers
 * Uses DOMParser for safer parsing
 */
export function sanitizeHTML(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Remove script tags
  doc.querySelectorAll('script').forEach(el => el.remove());

  // Remove event attributes
  doc.body.querySelectorAll('*').forEach(el => {
    Array.from(el.attributes)
      .filter(attr => attr.name.startsWith('on'))
      .forEach(attr => el.removeAttribute(attr.name));
  });

  return doc.body.innerHTML;
}

/**
 * Format list view details for Discord
 */
export function formatListViewDetails(details: string): string {
  if (!details) return '';
  const lines = details.split('\n').filter(line => line.trim());
  if (lines.length <= 1) return details;

  return lines[0] + '\n' + lines.slice(1)
    .map(line => `> ${line}`)
    .join('\n');
}

/**
 * Remove specific elements from HTML content
 * Uses DOMParser for safer parsing
 */
export function removeElementsFromHtml(html: string, elements: HTMLElement[]): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  elements.forEach(element => {
    const selector = element.tagName.toLowerCase() +
      Array.from(element.classList)
        .map(c => '.' + c)
        .join('');
    doc.body.querySelector(selector)?.remove();
  });

  return doc.body.innerHTML;
}

export interface TraitExtractionResult {
  traits: string;
  traitDivs: HTMLElement[];
}

/**
 * Extract and format traits from container for Discord display
 */
export function extractAndFormatTraits(container: HTMLElement): TraitExtractionResult {
  const traitDivs = Array.from(container.querySelectorAll('.trait')) as HTMLElement[];
  const uniqueTraits = [...new Set(traitDivs.map(div => div.textContent?.trim() || ''))];
  const traits = uniqueTraits.map(trait => `**${trait}**`).join(' ');
  return { traits, traitDivs };
}

/**
 * Safely extract text content from element
 */
export function safeExtract(
  container: Element,
  selector: string,
  index: number = 0,
  defaultValue: string = ''
): string {
  const elements = container.querySelectorAll(selector);
  return elements.length > index
    ? elements[index].textContent?.trim() || defaultValue
    : defaultValue;
}
