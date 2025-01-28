/**
 * Main content script for Firefox extension
 */

import { setupLogging, injectCSS } from './src/utils/uiUtils.js';
import pageObserver from './src/modules/pageObserver.js';
import characterManager from './src/modules/characterManager.js';

// Set up enhanced console logging
setupLogging();

/**
 * Injects required resources
 */
function injectResources() {
  injectCSS("toast.css");
}

/**
 * Initializes the extension
 */
function initializeExtension() {
  console.log('Injecting Resources');
  injectResources();
  console.log('Resources Injected');

  console.log("Starting Observers");
  pageObserver.observeDiceHistory();
  pageObserver.observeSidebar();
  pageObserver.handleDynamicContent();
  pageObserver.setupMutationObserver();
  console.log("Observers Started");
}

/**
 * Observes for new content and reinitializes if needed
 */
function observeForNewContent() {
  const observer = new MutationObserver(() => {
    console.log("DOM mutation detected, initializing extension.");
    initializeExtension();
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Sets up web navigation listener for Firefox
 */
function setupWebNavigationListener() {
  browser.webNavigation.onCompleted.addListener(
    (details) => {
      if (details.frameId === 0) {
        console.log("WebNavigation completed, re-initializing extension.");
        initializeExtension();
      }
    },
    { url: [{ hostContains: 'pathbuilder' }] }
  );
}

// Initialize the extension
initializeExtension();
observeForNewContent();
setupWebNavigationListener();