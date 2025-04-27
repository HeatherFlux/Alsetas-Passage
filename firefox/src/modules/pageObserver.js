/**
 * Page observer module for handling dynamic content
 */

import { createExportButton, hasEventListener, registerEventListener, showToast } from '../utils/uiUtils.js';
import { removeElementsFromHtml, extractAndFormatTraits, convertHtmlToMarkdown } from '../utils/htmlUtils.js';
import characterManager from './characterManager.js';

class PageObserver {
    constructor() {
        this.observers = new Set();
        this.setupMessageHandling();
    }

    /**
     * Disconnects all active observers
     */
    cleanup() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
    }

    /**
     * Tracks a new observer
     * @param {MutationObserver} observer - The observer to track
     */
    trackObserver(observer) {
        this.observers.add(observer);
    }

    /**
     * Sets up message handling for Discord communication
     */
    setupMessageHandling() {
        this.sendToDiscord = async (message) => {
            try {
                console.log("Attempting to send message to Discord. Size:", new TextEncoder().encode(message).length, "bytes");

                const response = await browser.runtime.sendMessage({
                    action: "sendToDiscord",
                    message: message,
                });
                if (response?.status !== "ok") {
                    const errorMsg = response?.message || "Unknown error";
                    const details = response?.details || {};

                    showToast(`Error sending to Discord: ${errorMsg}`);
                    console.error("Failed to send message to background script:", {
                        response,
                        error: errorMsg,
                        messageSize: details.messageSize || new TextEncoder().encode(message).length,
                        messagePreview: details.messagePreview || message.substring(0, 100) + "..."
                    });
                }
            } catch (error) {
                showToast(`Error sending to Discord: ${error.message || "Unknown error"}`);
                console.error("Error sending message to background script:", {
                    error: error.message,
                    stack: error.stack,
                    messageSize: new TextEncoder().encode(message).length,
                    messagePreview: message.substring(0, 100) + "..."
                });
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
    async handleButtonClick(event, div) {
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
        const title = (titleDiv && titleDiv.innerText) ? titleDiv.innerText.trim() : "Untitled";

        const { traits, traitDivs } = extractAndFormatTraits(detailDiv);
        const formattedTraits = traits ? traits.trim() : "";

        let contentHtml = detailDiv.innerHTML;
        contentHtml = removeElementsFromHtml(contentHtml, traitDivs);

        const button = div.querySelector(".discord-export-button");
        if (button) {
            contentHtml = removeElementsFromHtml(contentHtml, [button]);
        }

        const contentMarkdown = convertHtmlToMarkdown(contentHtml).trim();
        const message = this.prepareMessage(title || "Untitled", formattedTraits, contentMarkdown);

        await this.sendToDiscord(message);
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
        let message = traits
            ? `**${title}**\n> **Traits:** ${traits}\n> ${formattedDetails}`
            : `**${title}**\n> ${formattedDetails}`;

        // Check if message might exceed Discord's limit and truncate if necessary
        const messageSize = new TextEncoder().encode(message).length;
        if (messageSize > 1900) { // Leave some buffer for safety
            const truncateAt = 1800 - title.length - (traits ? traits.length : 0);
            const truncatedDetails = formattedDetails.substring(0, truncateAt);
            message = traits
                ? `**${title}**\n> **Traits:** ${traits}\n> ${truncatedDetails}...\n> (Content truncated due to Discord's message limit)`
                : `**${title}**\n> ${truncatedDetails}...\n> (Content truncated due to Discord's message limit)`;
        }

        return message;
    }

    /**
     * Initializes all observers
     */
    initialize() {
        this.cleanup(); // Clean up any existing observers
        this.observeDiceHistory();
        this.observeSidebar();
        this.observeStatBlock();
        this.setupMutationObserver();
    }

    /**
     * Handles dynamically loaded content
     */
    handleDynamicContent() {
        // Initialize all observers first
        this.initialize();

        // Process existing containers
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
                let detailDiv = container.querySelector(".listview-detail");
                if (detailDiv && detailDiv.innerHTML.trim() === "") {
                    detailDiv = detailDiv.nextElementSibling;
                }
                if (detailDiv) {
                    detailDiv.classList.toggle("hidden");
                    if (!detailDiv.classList.contains("hidden")) {
                        this.addDetailExportButton(container);
                    }
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

        // Create and track the observer
        const observer = new MutationObserver(() => this.logDiceHistory());
        this.trackObserver(observer);
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
            let characterName = characterManager.fetchCharacterName() || characterManager.characterName;
            
            // Use the active monster name if we have one
            if (this.activeMonsterName) {
                console.log("Using active monster name for roll:", this.activeMonsterName);
                characterName = this.activeMonsterName;
            } else {
                characterName = characterName || "Unknown Character";
            }

            await browser.runtime.sendMessage({
                action: "logCharacterName",
                data: characterName,
                history: latestHistory.innerHTML,
                title: diceTitle || "Roll"
            });
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

        this.trackObserver(observer);
        observer.observe(sidebar, { childList: true, subtree: true });
    }

    /**
     * Observes stat block for changes
     */
    observeStatBlock() {
        console.log("Starting observeStatBlock");
        const statBlock = document.querySelector('.div-statblock');
        console.log("Found stat block?", !!statBlock);
        if (!statBlock) {
            console.log("Stat block not found, skipping observer setup");
            return;
        }

        // Store the current monster name when found
        let currentMonsterName = '';
        const subtitle = statBlock.querySelector('.subtitle');
        console.log("Found subtitle?", !!subtitle, "Content:", subtitle?.textContent);
        if (subtitle) {
            currentMonsterName = subtitle.textContent.trim();
            // Store the name globally for the instance
            this.currentMonsterName = currentMonsterName;
            console.log("Initial monster name:", currentMonsterName);
        }

        // Watch for dice button clicks
        const diceButtons = statBlock.querySelectorAll('.dice-button');
        console.log("Initial dice buttons found:", diceButtons.length);

        // Add click listeners to initial buttons
        diceButtons.forEach(button => {
            if (!button.hasClickListener) {
                button.hasClickListener = true;
                button.addEventListener('click', () => {
                    console.log("Dice button clicked for monster:", this.currentMonsterName);
                    // Set this monster as the active roller
                    this.activeMonsterName = this.currentMonsterName;
                });
                console.log("Added click listener to button");
            }
        });

        const observer = new MutationObserver((mutations) => {
            console.log("Stat block changed, processing", mutations.length, "mutations");
            for (const mutation of mutations) {
                // Look for new dice buttons
                const newDiceButtons = statBlock.querySelectorAll('.dice-button:not([data-has-listener])');
                if (newDiceButtons.length > 0) {
                    console.log("Found", newDiceButtons.length, "new dice buttons");
                    newDiceButtons.forEach(button => {
                        button.dataset.hasListener = 'true';
                        button.addEventListener('click', () => {
                            console.log("New dice button clicked for monster:", this.currentMonsterName);
                            // Set this monster as the active roller
                            this.activeMonsterName = this.currentMonsterName;
                        });
                    });
                }

                // Update monster name if subtitle changes
                const newSubtitle = statBlock.querySelector('.subtitle');
                if (newSubtitle) {
                    const newName = newSubtitle.textContent.trim();
                    if (newName !== this.currentMonsterName) {
                        console.log("Monster name changed from", this.currentMonsterName, "to", newName);
                        this.currentMonsterName = newName;
                    }
                }
            }
        });

        console.log("Setting up mutation observer");
        this.trackObserver(observer);
        observer.observe(statBlock, { 
            childList: true, 
            subtree: true,
            attributes: true,
            characterData: true 
        });
        console.log("Stat block observer setup complete");
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

        this.trackObserver(observer);
        observer.observe(document.body, { childList: true, subtree: true });
    }
}

export default new PageObserver();