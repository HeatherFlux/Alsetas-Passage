/**
 * UI components and event handling utilities
 */

// Event listener registry for preventing duplicates
export const eventListenerRegistry = new WeakMap();

/**
 * Shows a toast notification
 * @param {string} message - Message to display
 * @param {number} duration - Duration in milliseconds
 */
export function showToast(message, duration = 3000) {
    let toastContainer = document.getElementById("alseta-toast-container");
    if (!toastContainer) {
        toastContainer = document.createElement("div");
        toastContainer.id = "alseta-toast-container";
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement("div");
    toast.className = "alseta-toast";
    const messageNode = document.createTextNode(message);
    toast.appendChild(messageNode);

    const closeButton = document.createElement("span");
    closeButton.className = "close-btn";
    closeButton.textContent = "×";
    closeButton.addEventListener("click", () => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 500);
    });

    toast.appendChild(closeButton);
    toastContainer.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 500);
    }, duration);
}

/**
 * Creates a "Send To Discord" button
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
 * Checks if an element has a specific event listener
 * @param {HTMLElement} element - The element to check
 * @param {string} eventName - Name of the event
 * @returns {boolean} Whether the listener exists
 */
export function hasEventListener(element, eventName) {
    return eventListenerRegistry.has(element) &&
        eventListenerRegistry.get(element).includes(eventName);
}

/**
 * Registers an event listener
 * @param {HTMLElement} element - The element to register
 * @param {string} eventName - Name of the event
 */
export function registerEventListener(element, eventName) {
    if (!eventListenerRegistry.has(element)) {
        eventListenerRegistry.set(element, []);
    }
    eventListenerRegistry.get(element).push(eventName);
}

/**
 * Injects CSS into the page
 * @param {string} cssPath - Path to the CSS file
 */
export function injectCSS(cssPath) {
    const css = document.createElement("link");
    css.href = browser.runtime.getURL(cssPath);
    css.rel = "stylesheet";
    document.head.appendChild(css);
}

/**
 * Sets up console logging with prefix
 */
export function setupLogging() {
    const log = console.log;
    console.log = function () {
        var args = Array.from(arguments);
        args.unshift('Alseta\'s Passage Log:' + ": ");
        log.apply(console, args);
    };
}