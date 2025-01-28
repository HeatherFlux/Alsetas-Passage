/**
 * Module for managing page observers and dynamic content
 */

import characterManager from './characterManager.js';
import { createExportButton, hasEventListener, registerEventListener } from '../utils/uiUtils.js';

class PageObserver {
    constructor() {
        this.browser = chrome;
    }

    /**
     * Adds export button to a div element
     * @param {HTMLElement} div - The div to add button to
     */
    addDetailExportButton(div) {
        let detailDiv = div.querySelector(".listview-detail") || div.querySelector(".listview-detail + *");
        if (!detailDiv) return;

        let button = detailDiv.querySelector(".discord-export-button");
        if (button && hasEventListener(button, "click")) {
            return;
        }

        if (!button) {
            button = createExportButton();
            detailDiv.insertBefore(button, detailDiv.firstChild);
        }

        if (!hasEventListener(button, "click")) {
            button.addEventListener("click", event => this.handleButtonClick(event, div));
            registerEventListener(button, "click");
        }
    }

    /**
     * Handles button click events
     * @param {Event} event - The click event
     * @param {HTMLElement} div - The container div
     */
    handleButtonClick(event, div) {
        event.stopPropagation();

        const detailDiv = div.querySelector(".listview-detail") || div.querySelector(".listview-detail + *");
        if (!detailDiv) {
            console.error("No detailDiv found for", div);
            return;
        }

        const title = div.querySelector(".listview-title")?.innerText || "";
        const { traits, traitDivs } = this.extractAndFormatTraits(detailDiv);

        let contentHtml = detailDiv.innerHTML;
        contentHtml = this.removeElementsFromHtml(contentHtml, traitDivs);

        const button = div.querySelector(".discord-export-button");
        if (button) {
            contentHtml = this.removeElementsFromHtml(contentHtml, [button]);
        }

        const contentMarkdown = this.convertHtmlToMarkdown(contentHtml);
        const message = this.prepareMessage(title, traits, contentMarkdown);

        console.log(`Preparing to send message to Discord: ${message}`);

        this.browser.runtime.sendMessage({
            action: "sendToDiscord",
            message: message,
        });
    }

    /**
     * Extracts and formats traits from detail div
     * @param {HTMLElement} detailDiv - The detail div element
     * @returns {Object} Traits and trait divs
     */
    extractAndFormatTraits(detailDiv) {
        const traitDivs = detailDiv.querySelectorAll(".trait");
        const traits = Array.from(new Set(
            Array.from(traitDivs).map(trait => `**${trait.innerText}**`)
        )).join(" ");
        return { traits, traitDivs };
    }

    /**
     * Removes elements from HTML content
     * @param {string} contentHtml - The HTML content
     * @param {HTMLElement[]} elements - Elements to remove
     * @returns {string} Updated HTML content
     */
    removeElementsFromHtml(contentHtml, elements) {
        elements.forEach(element => {
            contentHtml = contentHtml.replace(element.outerHTML, "");
        });
        return contentHtml;
    }

    /**
     * Handles dynamically loaded content
     */
    handleDynamicContent() {
        const containers = document.querySelectorAll(".listview-item, .div-info-lm-box");
        containers.forEach(div => {
            this.addDetailExportButton(div);
            this.setupContainerClickListener(div);
        });
    }

    /**
     * Sets up click listener for container elements
     * @param {HTMLElement} container - The container element
     */
    setupContainerClickListener(container) {
        container.addEventListener("click", () => {
            setTimeout(() => {
                let hiddenDetailDiv = container.querySelector(".listview-detail.hidden") ||
                    container.querySelector(".listview-detail.hidden + *");
                if (hiddenDetailDiv) {
                    hiddenDetailDiv.classList.remove("hidden");
                    this.addDetailExportButton(container);
                }
            }, 500);
        });
    }

    /**
     * Observes dice history for changes
     */
    observeDiceHistory() {
        const diceHistoryDiv = document.getElementById("dice-history");
        if (!diceHistoryDiv) {
            console.log("Dice history div not found");
            return;
        }

        const observer = new MutationObserver(() => {
            this.logDiceHistory();
        });

        observer.observe(diceHistoryDiv, { childList: true });
    }

    /**
     * Observes sidebar for updates
     */
    observeSidebar() {
        const sidebar = document.querySelector(".dice-tray");
        if (!sidebar) {
            console.log("Sidebar not found");
            return;
        }

        const observer = new MutationObserver(() => {
            const diceTitle = characterManager.fetchDiceTitle();
            const fetchedCharacterName = characterManager.fetchCharacterName();
            if (fetchedCharacterName) {
                characterManager.characterName = fetchedCharacterName;
                console.log(`Updated Global Character Name: ${characterManager.characterName}`);
            }
            console.log(`Dice title updated: ${diceTitle}`);
        });

        observer.observe(sidebar, { childList: true, subtree: true });
    }

    /**
     * Observes statblock for changes
     */
    observeStatblock() {
        const statblock = document.querySelector(".div-statblock");
        if (!statblock) return;

        const observer = new MutationObserver(mutationsList => {
            for (let mutation of mutationsList) {
                if (mutation.type === 'childList' || mutation.type === 'subtree') {
                    if (characterManager.isBetaPage()) {
                        const htmlContent = statblock.innerHTML;
                        const stats = characterManager.extractCharacterData(htmlContent);
                        characterManager.characterName = stats.name;
                        const diceTitle = characterManager.fetchDiceTitle();

                        this.browser.runtime.sendMessage({
                            action: "logCharacterName",
                            data: characterManager.characterName,
                            history: stats,
                            title: diceTitle,
                        });
                    }
                }
            }
        });

        observer.observe(statblock, { childList: true, subtree: true });
    }

    /**
     * Sets up page observer for statblock
     */
    observePageForStatblock() {
        const observer = new MutationObserver(() => {
            const statblock = document.querySelector(".div-statblock");
            if (statblock) {
                this.observeStatblock();
                observer.disconnect();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    /**
     * Initializes all observers
     */
    initializeObservers() {
        this.observeDiceHistory();
        this.observeSidebar();
        this.observePageForStatblock();
    }

    /**
     * Sets up mutation observer for dynamic content
     */
    setupMutationObserver() {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element Node
                        if (node.matches(".listview-item, .div-info-lm-box")) {
                            this.addDetailExportButton(node);
                            this.setupContainerClickListener(node);
                        } else {
                            // Check for any child .listview-item elements
                            node.querySelectorAll(".listview-item, .div-info-lm-box").forEach(child => {
                                this.addDetailExportButton(child);
                                this.setupContainerClickListener(child);
                            });
                        }
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }
}

export default new PageObserver();