/**
 * Page observer module for handling dynamic content
 */

import { createExportButton, hasEventListener, registerEventListener, showToast } from '../utils/uiUtils.js';
import { removeElementsFromHtml, extractAndFormatTraits, convertHtmlToMarkdown } from '../utils/htmlUtils.js';
import characterManager from './characterManager.js';

class PageObserver {
    constructor() {
        this.setupMessageHandling();
    }

    /**
     * Sets up message handling for Discord communication
     */
    setupMessageHandling() {
        this.sendToDiscord = async (message) => {
            try {
                const response = await browser.runtime.sendMessage({
                    action: "sendToDiscord",
                    message: message,
                });

                if (response?.status !== "ok") {
                    showToast("Error sending to Discord");
                    console.error("Failed to send message to background script");
                }
            } catch (error) {
                showToast("Error sending to Discord");
                console.error("Error sending message to background script:", error);
            }
        };
    }

    /**
     * Adds export button to a div element
     * @param {HTMLElement} div - The div to add button to
     */
    addDetailExportButton(div) {
        let detailDiv = div.querySelector(".listview-detail");
        if (detailDiv && detailDiv.innerHTML.trim() === "") {
            detailDiv = detailDiv.nextElementSibling;
        }

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
            button.addEventListener("click", (event) => this.handleButtonClick(event, div));
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

        let detailDiv = div.querySelector(".listview-detail");
        if (detailDiv && detailDiv.innerHTML.trim() === "") {
            detailDiv = detailDiv.nextElementSibling;
        }

        if (!detailDiv) {
            console.error("No detailDiv found for", div);
            return;
        }

        const titleDiv = div.querySelector(".listview-title");
        const title = titleDiv ? titleDiv.innerText : "";

        const { traits, traitDivs } = extractAndFormatTraits(detailDiv);

        let contentHtml = detailDiv.innerHTML;
        contentHtml = removeElementsFromHtml(contentHtml, traitDivs);

        const button = div.querySelector(".discord-export-button");
        if (button) {
            contentHtml = removeElementsFromHtml(contentHtml, [button]);
        }

        const contentMarkdown = convertHtmlToMarkdown(contentHtml);
        const message = this.prepareMessage(title, traits, contentMarkdown);

        this.sendToDiscord(message);
    }

    /**
     * Prepares message for Discord
     * @param {string} title - Message title
     * @param {string} traits - Character traits
     * @param {string} contentMarkdown - Main content
     * @returns {string} Formatted message
     */
    prepareMessage(title, traits, contentMarkdown) {
        const formattedDetails = contentMarkdown.replace(/\n+/g, "\n> ").trim();
        return traits
            ? `**${title}**\n> **Traits:** ${traits}\n> ${formattedDetails}`
            : `**${title}**\n> ${formattedDetails}`;
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
                let hiddenDetailDiv = container.querySelector(".listview-detail.hidden");
                if (hiddenDetailDiv && hiddenDetailDiv.innerHTML.trim() === "") {
                    hiddenDetailDiv = hiddenDetailDiv.nextElementSibling;
                }
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

        const observer = new MutationObserver(() => this.logDiceHistory());
        observer.observe(diceHistoryDiv, { childList: true });
    }

    /**
     * Logs dice history to Discord
     */
    async logDiceHistory() {
        try {
            const diceHistoryDiv = document.getElementById("dice-history");
            if (!diceHistoryDiv) return;

            const latestHistory = diceHistoryDiv.firstElementChild;
            if (!latestHistory) throw new Error('No History Found');

            const diceTitle = characterManager.fetchDiceTitle();

            if (characterManager.isBetaPage()) {
                await browser.runtime.sendMessage({
                    action: "logCharacterName",
                    data: characterManager.characterName,
                    history: latestHistory.innerHTML,
                    title: diceTitle,
                });
            } else {
                const fetchedCharacterName = characterManager.fetchCharacterName();
                if (fetchedCharacterName) {
                    await browser.runtime.sendMessage({
                        action: "logCharacterName",
                        data: fetchedCharacterName,
                        history: latestHistory.innerHTML,
                        title: diceTitle,
                    });
                } else {
                    await browser.runtime.sendMessage({
                        action: "logDiceHistory",
                        data: latestHistory.innerHTML,
                        title: diceTitle,
                    });
                }
            }
        } catch (error) {
            console.error("Error logging dice history:", error);
        }
    }

    /**
     * Observes sidebar for updates
     */
    observeSidebar() {
        const sidebar = document.querySelector(".dice-tray");
        if (!sidebar) return;

        const observer = new MutationObserver(() => {
            const diceTitle = characterManager.fetchDiceTitle();
            const fetchedCharacterName = characterManager.fetchCharacterName();
            if (fetchedCharacterName) {
                characterManager.characterName = fetchedCharacterName;
            }
        });

        observer.observe(sidebar, { childList: true, subtree: true });
    }

    /**
     * Sets up mutation observer for dynamic content
     */
    setupMutationObserver() {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        if (node.matches(".listview-item, .div-info-lm-box")) {
                            this.addDetailExportButton(node);
                            this.setupContainerClickListener(node);
                        } else {
                            node.querySelectorAll(".listview-item, .div-info-lm-box")
                                .forEach(child => {
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