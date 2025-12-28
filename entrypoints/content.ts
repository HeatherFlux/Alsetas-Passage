/**
 * Content script for Pathbuilder2e integration
 */

import pageObserver from '../modules/pageObserver';
import { injectCSS } from '../utils/ui';

export default defineContentScript({
  matches: [
    '*://pathbuilder2e.com/*',
    '*://www.pathbuilder2e.com/*',
    '*://beta.pathbuilder2e.com/*',
  ],

  main() {
    console.log("Alseta's Passage: Content script loaded on Pathbuilder2e");

    // Inject custom CSS for toast notifications
    injectCSS('assets/toast.css');

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        pageObserver.init();
      });
    } else {
      pageObserver.init();
    }

    // Cleanup on page unload
    window.addEventListener('unload', () => {
      pageObserver.cleanup();
    });
  },
});
