/**
 * Utility functions for UI manipulation and creation
 */

/**
 * Creates a toast notification container if it doesn't exist
 * @returns {HTMLElement} The toast container element
 */
function getOrCreateToastContainer() {
    let container = document.getElementById("alseta-toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "alseta-toast-container";
        document.body.appendChild(container);
    }
    return container;
}

/**
 * Shows a toast notification
 * @param {string} message - The message to display
 * @param {number} duration - Duration in milliseconds to show the toast
 */
export function showToast(message, duration = 3000) {
    const toastContainer = getOrCreateToastContainer();

    const toast = document.createElement("div");
    toast.className = "alseta-toast";
    toast.textContent = message;

    const closeButton = document.createElement("span");
    closeButton.className = "close-btn";
    closeButton.textContent = "×";
    closeButton.addEventListener("click", () => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 500);
    });

    toast.appendChild(closeButton);
    toastContainer.appendChild(toast);

    // Show animation
    setTimeout(() => toast.classList.add("show"), 10);

    // Auto-hide
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 500);
    }, duration);
}

/**
 * Creates a "Send To Discord" button with proper styling
 * @returns {HTMLButtonElement} The created button
 */
export function createExportButton() {
    const button = document.createElement("button");
    button.textContent = "Send To Discord";
    button.className = "discord-export-button";

    Object.assign(button.style, {
        fontSize: "12px",
        marginBottom: "10px",
        padding: "2px 5px",
        display: "inline-block",
        verticalAlign: "middle",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        width: "auto"
    });

    return button;
}

/**
 * Injects CSS assets into the page
 * @param {string} cssPath - Path to the CSS file
 */
export function injectCSS(cssPath) {
    const css = document.createElement("link");
    css.href = cssPath;
    css.rel = "stylesheet";
    document.head.appendChild(css);
}

/**
 * Registry to track event listeners
 */
export const eventListenerRegistry = new WeakMap();

/**
 * Checks if an element has a specific event listener
 * @param {HTMLElement} element - The element to check
 * @param {string} eventName - Name of the event
 * @returns {boolean} Whether the element has the event listener
 */
export function hasEventListener(element, eventName) {
    return eventListenerRegistry.has(element) &&
        eventListenerRegistry.get(element).includes(eventName);
}

/**
 * Registers an event listener in the registry
 * @param {HTMLElement} element - The element to register
 * @param {string} eventName - Name of the event
 */
export function registerEventListener(element, eventName) {
    if (!eventListenerRegistry.has(element)) {
        eventListenerRegistry.set(element, []);
    }
    eventListenerRegistry.get(element).push(eventName);
}