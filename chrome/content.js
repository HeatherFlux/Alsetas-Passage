/**
 * Main content script for Alseta's Passage extension
 */

import { injectCSS } from './src/utils/uiUtils.js';
import pageObserver from './src/modules/pageObserver.js';

// Enhanced Console Logging
const originalConsoleLog = console.log;
console.log = function (...args) {
  originalConsoleLog('Alseta\'s Passage Log:', ...args);
};

/**
 * Injects required assets
 */
function injectAssets() {
  injectCSS(chrome.runtime.getURL("toast.css"));
}

/**
 * Initializes the extension
 */
function init() {
  pageObserver.initializeObservers();
  pageObserver.setupMutationObserver();
  pageObserver.handleDynamicContent();
}

// Initialize on DOM Content Loaded
document.addEventListener("DOMContentLoaded", () => {
  injectAssets();
  init();
});

// Initialize on Window Load
window.addEventListener("load", init);
