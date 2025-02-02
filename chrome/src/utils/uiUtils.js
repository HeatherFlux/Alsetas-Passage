/**
 * UI utility functions
 */

const eventListenerRegistry = new WeakMap();

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {number} duration - Duration in milliseconds
 */
function showToast(message, duration = 3000) {
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
    `;

    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;
    toast.appendChild(messageSpan);

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
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
        if (container.children.length === 0) {
            container.remove();
        }
    };

    closeBtn.addEventListener('click', removeToast);
    setTimeout(removeToast, duration);
}

/**
 * Create an export button
 * @returns {HTMLButtonElement} The created button
 */
function createExportButton() {
    const button = document.createElement('button');
    button.textContent = 'Send To Discord';
    button.className = 'discord-export-button';
    const styles = {
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
        marginTop: '10px'
    };
    Object.assign(button.style, styles);
    return button;
}

/**
 * Check if element has event listener
 * @param {HTMLElement} element - Element to check
 * @param {string} eventType - Event type
 * @returns {boolean} Whether element has listener
 */
function hasEventListener(element, eventType) {
    const listeners = eventListenerRegistry.get(element);
    return listeners ? listeners.has(eventType) : false;
}

/**
 * Register event listener
 * @param {HTMLElement} element - Element to register on
 * @param {string} eventType - Event type
 */
function registerEventListener(element, eventType) {
    if (!eventListenerRegistry.has(element)) {
        eventListenerRegistry.set(element, new Set());
    }
    eventListenerRegistry.get(element).add(eventType);
}

/**
 * Inject CSS file
 * @param {string} cssPath - Path to CSS file
 */
function injectCSS(cssPath) {
    if (!cssPath) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = typeof browser !== 'undefined' && browser.runtime ?
        browser.runtime.getURL(cssPath) :
        new URL(cssPath, window.location.href).href;
    document.head.appendChild(link);
}

/**
 * Set up logging with prefix
 */
function setupLogging() {
    const originalLog = console.log;
    console.log = (...args) => {
        originalLog("Alseta's Passage Log:", ': ', ...args);
    };
}

module.exports = {
    showToast,
    createExportButton,
    hasEventListener,
    registerEventListener,
    eventListenerRegistry,
    injectCSS,
    setupLogging
};