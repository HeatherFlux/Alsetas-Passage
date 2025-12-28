/**
 * Background service worker for handling Discord webhook communication
 */

import { getActiveWebhook } from '../utils/storage';
import { createWebhookBody, isMessageTooLarge, DISCORD_MESSAGE_LIMIT } from '../utils/discord';

interface SendToDiscordRequest {
  action: 'sendToDiscord';
  message: string;
}

interface MessageResponse {
  status: 'ok' | 'error';
  message?: string;
  details?: {
    messageSize: number;
    messagePreview: string;
  };
}

export default defineBackground(() => {
  console.log("Alseta's Passage: Background script loaded");

  /**
   * Send a message to Discord via webhook
   */
  async function sendToDiscord(message: string): Promise<MessageResponse> {
    // Check message size
    const messageSize = new TextEncoder().encode(message).length;
    if (isMessageTooLarge(message)) {
      console.error("Alseta's Passage: Message too large:", {
        size: messageSize,
        preview: message.substring(0, 100) + '...',
      });
      return {
        status: 'error',
        message: `Message size (${messageSize} bytes) exceeds Discord's ${DISCORD_MESSAGE_LIMIT} character limit`,
        details: {
          messageSize,
          messagePreview: message.substring(0, 100) + '...',
        },
      };
    }

    // Get active webhook
    const webhook = await getActiveWebhook();
    if (!webhook) {
      console.error("Alseta's Passage: No active webhook configured");
      return {
        status: 'error',
        message: 'No active webhook configured. Please add a webhook in the extension popup.',
      };
    }

    try {
      console.log("Alseta's Passage: Sending message to Discord");
      const response = await fetch(webhook.url, createWebhookBody(message));

      if (response.ok) {
        console.log("Alseta's Passage: Message sent successfully");
        return { status: 'ok' };
      }

      // Handle Discord API errors
      let errorDetails: unknown;
      try {
        errorDetails = await response.json();
      } catch {
        errorDetails = await response.text();
      }

      console.error("Alseta's Passage: Discord API Error:", {
        status: response.status,
        statusText: response.statusText,
        responseBody: errorDetails,
        messageSize,
        messagePreview: message.substring(0, 100) + '...',
      });

      const errorMessage = typeof errorDetails === 'object' && errorDetails !== null && 'message' in errorDetails
        ? String((errorDetails as { message: string }).message)
        : String(errorDetails) || response.statusText;

      return {
        status: 'error',
        message: `Discord error: ${response.status} - ${errorMessage}`,
        details: {
          messageSize,
          messagePreview: message.substring(0, 100) + '...',
        },
      };
    } catch (error) {
      console.error("Alseta's Passage: Network error:", error);
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: {
          messageSize,
          messagePreview: message.substring(0, 100) + '...',
        },
      };
    }
  }

  // Listen for messages from content script
  browser.runtime.onMessage.addListener(
    (request: SendToDiscordRequest, _sender, sendResponse: (response: MessageResponse) => void) => {
      if (request.action === 'sendToDiscord') {
        sendToDiscord(request.message).then(sendResponse);
        return true; // Keep message channel open for async response
      }

      console.error("Alseta's Passage: Unknown action:", request);
      sendResponse({ status: 'error', message: 'Unknown action' });
      return false;
    }
  );
});
