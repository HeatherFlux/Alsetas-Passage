/**
 * Module for managing Discord webhook communication
 */

import { createWebhookBody } from '../utils/discordUtils.js';

class DiscordManager {
    constructor() {
        this.browser = chrome;
    }

    /**
     * Gets data from storage
     * @param {string[]} keys - Keys to retrieve from storage
     * @returns {Promise<Object>} Storage data
     */
    async getStorageData(keys) {
        try {
            return await this.browser.storage.sync.get(keys);
        } catch (error) {
            console.error("Error getting storage data:", error);
            throw error;
        }
    }

    /**
     * Sends a message to Discord via webhook
     * @param {string} message - Message to send
     * @returns {Promise<string>} Status message
     */
    async sendToDiscord(message) {
        try {
            const { webhooks = [], activeWebhook } = await this.getStorageData([
                "webhooks",
                "activeWebhook"
            ]);

            const webhook = webhooks.find(w => w.name === activeWebhook);
            if (!webhook) {
                console.error("Active webhook not found");
                throw new Error("Active webhook not found");
            }

            console.log("Sending message to webhook:", webhook.url);
            const response = await fetch(webhook.url, createWebhookBody(message));

            if (response.ok) {
                console.log("Message sent to Discord");
                return "Message sent";
            } else {
                console.error("Error sending message to Discord:", response.statusText);
                return "Error";
            }
        } catch (error) {
            console.error("Error:", error);
            return "Error";
        }
    }

    /**
     * Handles sending a message to Discord
     * @param {Object} request - The request object
     * @param {Function} sendResponse - Callback function for response
     */
    async handleSendToDiscord(request, sendResponse) {
        try {
            const result = await this.sendToDiscord(request.message);
            sendResponse({ status: result === "Message sent" ? "ok" : "error" });
        } catch (error) {
            sendResponse({ status: "error", message: error.message });
        }
    }

    /**
     * Handles logging dice history
     * @param {Object} request - The request object
     * @param {Function} sendResponse - Callback function for response
     */
    async handleLogDiceHistory(request, sendResponse) {
        const { data: characterName = "Unknown Character", title } = request;
        const formattedMessage = this.parseDiceHistory(data, title, characterName);

        try {
            const result = await this.sendToDiscord(formattedMessage);
            sendResponse({ status: result === "Message sent" ? "ok" : "error" });
        } catch (error) {
            sendResponse({ status: "error", message: error.message });
        }
    }

    /**
     * Handles logging character name with history
     * @param {Object} request - The request object
     * @param {Function} sendResponse - Callback function for response
     */
    async handleLogCharacterName(request, sendResponse) {
        const { data: characterName = "Unknown Character", history, title } = request;
        const formattedMessage = this.parseDiceHistory(history, title, characterName);

        try {
            const result = await this.sendToDiscord(formattedMessage);
            sendResponse({ status: result === "Message sent" ? "ok" : "error" });
        } catch (error) {
            sendResponse({ status: "error", message: error.message });
        }
    }

    /**
     * Sets up message listeners for Discord communication
     */
    setupMessageListeners() {
        this.browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
            const handlers = {
                sendToDiscord: () => this.handleSendToDiscord(request, sendResponse),
                logDiceHistory: () => this.handleLogDiceHistory(request, sendResponse),
                logCharacterName: () => this.handleLogCharacterName(request, sendResponse)
            };

            const handler = handlers[request.action];
            if (handler) {
                handler();
            } else {
                console.error("Unknown action:", request.action);
                sendResponse({ status: "error", message: "Unknown action" });
            }

            return true; // Keep the message channel open for async response
        });
    }
}

export default new DiscordManager();