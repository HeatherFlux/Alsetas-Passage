// background.js

// Utility Functions
const utils = {
  async getStorageData(keys) {
    try {
      return await chrome.storage.sync.get(keys);
    } catch (error) {
      console.error("Error getting storage data:", error);
      throw error;
    }
  },
  stripHTML(html) {
    return html.replace(/<\/?[^>]+(>|$)/g, " ");
  },
  removePrefix(history) {
    return history.replace(/\d{1,2}:\d{2}:\d{2} (AM|PM) Your /, '');
  },
  parseDiceHistory(history, title, characterName) {
    history = this.removePrefix(history);
    history = this.stripHTML(history);
    const match = history.split(" ");

    if (match.length === 0) return this.stripHTML(history);

    const rollType = match[0];
    const rollValue = match[2] || "";

    switch (rollType) {
      case 'Critical':
        return `Critical Hit! **${characterName}'s** ${title} caused **${rollValue}** damage.`;
      case 'Attack':
        return `**${characterName}'s** ${title} attempts to hit with a **${rollValue}**.`;
      case 'Damage':
        return `**${characterName}'s** ${title} caused **${rollValue}** damage.`;
      case 'Free':
        return `**${characterName}** rolls ${match[2] || ''} with a ${match[4] || ''}`;
      default:
        return `**${characterName}** rolls ${title} for **${match[1] || ''}**.`;
    }
  }
};

// Send Message to Discord via Webhook
async function sendToDiscord(message) {
  try {
    const { webhooks = [], activeWebhook } = await utils.getStorageData(["webhooks", "activeWebhook"]);
    const webhook = webhooks.find(w => w.name === activeWebhook);

    if (!webhook) {
      console.error("Active webhook not found");
      throw new Error("Active webhook not found");
    }

    console.log("Sending message to webhook:", webhook.url);
    const response = await fetch(webhook.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        avatar_url: "https://i.imgur.com/xi6Qssm.png",
        content: message,
      }),
    });

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

// Handle Sending to Discord
async function handleSendToDiscord(request, sendResponse) {
  try {
    const result = await sendToDiscord(request.message);
    sendResponse({ status: result === "Message sent" ? "ok" : "error" });
  } catch (error) {
    sendResponse({ status: "error", message: error.message });
  }
}

// Handle Logging Dice History
async function handleLogDiceHistory(request, sendResponse) {
  const { data, title } = request;
  const characterName = request.data || "Unknown Character";
  const formattedMessage = utils.parseDiceHistory(data, title, characterName);

  try {
    const result = await sendToDiscord(formattedMessage);
    sendResponse({ status: result === "Message sent" ? "ok" : "error" });
  } catch (error) {
    sendResponse({ status: "error", message: error.message });
  }
}

// Handle Logging Character Name with History
async function handleLogCharacterName(request, sendResponse) {
  const { data, history, title } = request;
  const characterName = data || "Unknown Character";
  const formattedMessage = utils.parseDiceHistory(history, title, characterName);

  try {
    const result = await sendToDiscord(formattedMessage);
    sendResponse({ status: result === "Message sent" ? "ok" : "error" });
  } catch (error) {
    sendResponse({ status: "error", message: error.message });
  }
}

// Message Listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "sendToDiscord":
      handleSendToDiscord(request, sendResponse);
      break;
    case "logDiceHistory":
      handleLogDiceHistory(request, sendResponse);
      break;
    case "logCharacterName":
      handleLogCharacterName(request, sendResponse);
      break;
    default:
      console.error("Unknown action:", request.action);
      sendResponse({ status: "error", message: "Unknown action" });
      break;
  }
  return true; // Keep the message channel open for async response
});
