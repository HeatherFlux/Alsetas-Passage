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
  pageObserver.handleDynamicContent(); // This now calls initialize() internally
  console.log("Observers Started");
}

/**
 * Observes for new content and reinitializes if needed
 */
// Track the content observer separately since it's not part of PageObserver
let contentObserver = null;

function observeForNewContent() {
  // Cleanup existing content observer if it exists
  if (contentObserver) {
    contentObserver.disconnect();
  }

  contentObserver = new MutationObserver((mutations) => {
    // Only reinitialize if significant changes occurred
    const hasSignificantChanges = mutations.some(mutation =>
      Array.from(mutation.addedNodes).some(node =>
        node.nodeType === 1 && // Element node
        (node.matches('.dice-tray, #dice-history') || // Important containers
          node.querySelector('.dice-tray, #dice-history')) // Or contains important elements
      )
    );

    if (hasSignificantChanges) {
      console.log("Significant DOM changes detected, reinitializing extension.");
      initializeExtension();
    }
  });

  contentObserver.observe(document.body, { childList: true, subtree: true });
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