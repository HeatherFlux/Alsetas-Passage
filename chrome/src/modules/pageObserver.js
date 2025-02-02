/**
 * Module for observing and handling page changes
 */

const { createExportButton } = require('../utils/uiUtils.js');
const { extractAndFormatTraits, removeElementsFromHtml } = require('../utils/htmlUtils.js');
const characterManager = require('./characterManager.js');

class PageObserver {
    constructor() {
        // Use browser for Firefox compatibility
        this.browser = typeof chrome !== 'undefined' ? chrome : browser;
        this.diceHistoryObserver = null;
        this.sidebarObserver = null;
        this.contentObserver = null;
    }

    /**
     * Add export button to detail div
     * @param {HTMLElement} div - The div to add button to
     */
    addDetailExportButton(div) {
        const detailDiv = div.querySelector('.listview-detail');
        if (!detailDiv || detailDiv.querySelector('.discord-export-button')) {
            return;
        }

        const button = createExportButton();
        button.addEventListener('click', () => this.handleExportClick(div));
        detailDiv.appendChild(button);
    }

    /**
     * Handle export button click
     * @param {HTMLElement} div - The div containing export data
     */
    async handleExportClick(div) {
        const title = div.querySelector('.listview-title')?.textContent.trim() || '';
        const detailDiv = div.querySelector('.listview-detail');
        const { traits, traitDivs } = extractAndFormatTraits(detailDiv);

        // Remove trait divs from content
        const content = removeElementsFromHtml(detailDiv.innerHTML, traitDivs);

        await this.browser.runtime.sendMessage({
            action: 'sendToDiscord',
            message: `**${title}**\n> **Traits:** ${traits}\n> ${content}`
        });
    }

    /**
     * Handle dynamic content changes
     */
    handleDynamicContent() {
        if (this.contentObserver) {
            this.contentObserver.disconnect();
        }

        this.contentObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.classList?.contains('listview-item')) {
                            this.addDetailExportButton(node);
                        }
                        const items = node.querySelectorAll('.listview-item');
                        items.forEach(item => this.addDetailExportButton(item));
                    }
                });
            });
        });

        this.contentObserver.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Handle initial items
        document.querySelectorAll('.listview-item').forEach(item => {
            this.addDetailExportButton(item);
        });
    }

    /**
     * Observe dice history changes
     */
    observeDiceHistory() {
        const diceHistoryDiv = document.getElementById('dice-history');
        if (!diceHistoryDiv) {
            console.log('Dice history div not found');
            return;
        }

        if (this.diceHistoryObserver) {
            this.diceHistoryObserver.disconnect();
        }

        this.diceHistoryObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    const newNode = mutation.addedNodes[0];
                    if (newNode.nodeType === Node.ELEMENT_NODE) {
                        this.handleDiceRoll(newNode);
                    }
                }
            });
        });

        this.diceHistoryObserver.observe(diceHistoryDiv, {
            childList: true
        });
    }

    /**
     * Handle new dice roll
     * @param {HTMLElement} rollNode - The new roll element
     */
    async handleDiceRoll(rollNode) {
        const characterName = characterManager.fetchCharacterName();
        const diceTitle = characterManager.fetchDiceTitle();
        const rollText = rollNode.textContent.trim();

        await this.browser.runtime.sendMessage({
            action: 'sendToDiscord',
            message: `**${characterName || 'Unknown Character'}** rolled ${diceTitle}: ${rollText}`
        });
    }

    /**
     * Clean up observers
     */
    cleanup() {
        if (this.diceHistoryObserver) {
            this.diceHistoryObserver.disconnect();
        }
        if (this.contentObserver) {
            this.contentObserver.disconnect();
        }
        if (this.sidebarObserver) {
            this.sidebarObserver.disconnect();
        }
    }
}

module.exports = new PageObserver();