const { JSDOM } = require('jsdom');

/**
 * Set up a basic DOM environment for testing
 */
function setupDOM() {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
        url: 'https://pathbuilder2e.com',
        referrer: 'https://pathbuilder2e.com',
        contentType: 'text/html',
    });

    // Add DOM globals
    global.window = dom.window;
    global.document = dom.window.document;
    global.HTMLElement = dom.window.HTMLElement;
    global.customElements = dom.window.customElements;
    global.Node = dom.window.Node;
    global.navigator = dom.window.navigator;

    return dom;
}

/**
 * Clean up the DOM environment
 */
function cleanupDOM() {
    // Clean up globals
    delete global.window;
    delete global.document;
    delete global.HTMLElement;
    delete global.customElements;
    delete global.Node;
    delete global.navigator;
}

module.exports = {
    setupDOM,
    cleanupDOM
};