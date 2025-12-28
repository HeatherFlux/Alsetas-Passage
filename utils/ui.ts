/**
 * UI utility functions for DOM manipulation
 */

const eventListenerRegistry = new WeakMap<HTMLElement, Set<string>>();

/**
 * Show a toast notification
 */
export function showToast(message: string, duration: number = 3000): void {
  let container = document.getElementById('alseta-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'alseta-toast-container';
    container.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
    `;
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'alseta-toast';
  toast.style.cssText = `
    background-color: #333;
    color: white;
    padding: 12px 24px;
    border-radius: 4px;
    margin-top: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    animation: slideIn 0.3s ease;
  `;

  const messageSpan = document.createElement('span');
  messageSpan.textContent = message;
  toast.appendChild(messageSpan);

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '\u00d7';
  closeBtn.className = 'close-btn';
  closeBtn.style.cssText = `
    background: none;
    border: none;
    color: white;
    margin-left: 10px;
    cursor: pointer;
    font-size: 18px;
  `;
  toast.appendChild(closeBtn);

  container.appendChild(toast);

  const removeToast = () => {
    toast.remove();
    if (container && container.children.length === 0) {
      container.remove();
    }
  };

  closeBtn.addEventListener('click', removeToast);
  setTimeout(removeToast, duration);
}

/**
 * Create a Discord export button
 */
export function createExportButton(): HTMLButtonElement {
  const button = document.createElement('button');
  button.textContent = 'Send To Discord';
  button.className = 'discord-export-button';
  button.style.cssText = `
    background-color: #5865F2;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 10px;
    font-weight: 500;
    transition: background-color 0.2s;
  `;

  button.addEventListener('mouseenter', () => {
    button.style.backgroundColor = '#4752C4';
  });
  button.addEventListener('mouseleave', () => {
    button.style.backgroundColor = '#5865F2';
  });

  return button;
}

/**
 * Check if element has registered event listener
 */
export function hasEventListener(element: HTMLElement, eventType: string): boolean {
  const listeners = eventListenerRegistry.get(element);
  return listeners ? listeners.has(eventType) : false;
}

/**
 * Register event listener for tracking
 */
export function registerEventListener(element: HTMLElement, eventType: string): void {
  if (!eventListenerRegistry.has(element)) {
    eventListenerRegistry.set(element, new Set());
  }
  eventListenerRegistry.get(element)!.add(eventType);
}

/**
 * Inject CSS from extension assets
 */
export function injectCSS(cssPath: string): void {
  if (!cssPath) return;

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = browser.runtime.getURL(cssPath);
  document.head.appendChild(link);
}
