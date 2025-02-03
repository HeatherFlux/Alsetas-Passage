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
            // Check message size (Discord limit is 2000 characters)
            const messageSize = new TextEncoder().encode(message).length;
            if (messageSize > 2000) {
                console.error("Message too large:", {
                    size: messageSize,
                    preview: message.substring(0, 100) + "..."
                });
                return `Error: Message size (${messageSize} bytes) exceeds Discord's 2000 character limit`;
            }

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
                console.log("Message sent to Discord successfully");
                return "Message sent";
            } else {
                let errorDetails;
                try {
                    errorDetails = await response.json();
                } catch {
                    errorDetails = await response.text();
                }

                console.error("Discord API Error:", {
                    status: response.status,
                    statusText: response.statusText,
                    responseBody: errorDetails,
                    messageSize: messageSize,
                    messagePreview: message.substring(0, 100) + "..."
                });

                const errorMessage = errorDetails?.message || errorDetails || response.statusText;
                return `Error: ${response.status} - ${errorMessage}`;
            }
        } catch (error) {
            console.error("Error in sendToDiscord:", {
                error: error.message,
                stack: error.stack,
                messageSize: message ? new TextEncoder().encode(message).length : 'N/A',
                messagePreview: message ? message.substring(0, 100) + "..." : 'N/A'
            });
            return `Error: ${error.message}`;
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
            if (result.startsWith("Error:")) {
                sendResponse({
                    status: "error",
                    message: result,
                    details: {
                        messageSize: new TextEncoder().encode(request.message).length,
                        messagePreview: request.message.substring(0, 100) + "..."
                    }
                });
            } else {
                sendResponse({ status: "ok" });
            }
        } catch (error) {
            console.error("Handler error:", {
                error: error.message,
                stack: error.stack,
                messageSize: request.message ? new TextEncoder().encode(request.message).length : 'N/A'
            });
            sendResponse({
                status: "error",
                message: error.message,
                details: {
                    messageSize: request.message ? new TextEncoder().encode(request.message).length : 'N/A',
                    messagePreview: request.message ? request.message.substring(0, 100) + "..." : 'N/A'
                }
            });
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
            if (result.startsWith("Error:")) {
                sendResponse({
                    status: "error",
                    message: result,
                    details: {
                        messageSize: new TextEncoder().encode(formattedMessage).length,
                        messagePreview: formattedMessage.substring(0, 100) + "..."
                    }
                });
            } else {
                sendResponse({ status: "ok" });
            }
        } catch (error) {
            console.error("Handler error:", {
                error: error.message,
                stack: error.stack,
                messageSize: formattedMessage ? new TextEncoder().encode(formattedMessage).length : 'N/A'
            });
            sendResponse({
                status: "error",
                message: error.message,
                details: {
                    messageSize: formattedMessage ? new TextEncoder().encode(formattedMessage).length : 'N/A',
                    messagePreview: formattedMessage ? formattedMessage.substring(0, 100) + "..." : 'N/A'
                }
            });
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
            if (result.startsWith("Error:")) {
                sendResponse({
                    status: "error",
                    message: result,
                    details: {
                        messageSize: new TextEncoder().encode(formattedMessage).length,
                        messagePreview: formattedMessage.substring(0, 100) + "..."
                    }
                });
            } else {
                sendResponse({ status: "ok" });
            }
        } catch (error) {
            console.error("Handler error:", {
                error: error.message,
                stack: error.stack,
                messageSize: formattedMessage ? new TextEncoder().encode(formattedMessage).length : 'N/A'
            });
            sendResponse({
                status: "error",
                message: error.message,
                details: {
                    messageSize: formattedMessage ? new TextEncoder().encode(formattedMessage).length : 'N/A',
                    messagePreview: formattedMessage ? formattedMessage.substring(0, 100) + "..." : 'N/A'
                }
            });
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