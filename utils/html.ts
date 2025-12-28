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
 */
export function sanitizeHTML(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;

  // Remove script tags
  const scripts = div.getElementsByTagName('script');
  while (scripts[0]) {
    scripts[0].parentNode?.removeChild(scripts[0]);
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
 */
export function removeElementsFromHtml(html: string, elements: HTMLElement[]): string {
  const div = document.createElement('div');
  div.innerHTML = html;

  elements.forEach(element => {
    const selector = element.tagName.toLowerCase() +
      Array.from(element.classList)
        .map(c => '.' + c)
        .join('');
    const match = div.querySelector(selector);
    if (match) {
      match.parentNode?.removeChild(match);
    }
  });

  return div.innerHTML;
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
