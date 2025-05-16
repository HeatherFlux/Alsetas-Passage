// Utility functions
async function getStorageData(keys) {
  try {
    return await browser.storage.sync.get(keys);
  } catch (error) {
    console.error("Error getting storage data:", error);
    throw error;
  }
}

function stripHTML(html) {
  return html.replace(/<\/?[^>]+(>|$)/g, " ");
}

function removePrefix(history) {
  return history.replace(/^\d{1,2}:\d{2}(:\d{2})?\s*(?:AM|PM)?\s*Your\s+/i, ``);
}

function parseDiceHistory(history, title) {
  history = removePrefix(history);
  history = stripHTML(history);
  const match = history.split(" ");

  if (match) {
    const rollType = match[0];
    const rollValue = match[2];

    console.log(match)
    switch (rollType) {
      case 'Critical':
        return `Critical Hit! **${characterName}'s** ${title} caused **${rollValue}** damage.`;
        break;
      case 'Attack':
        return `**${characterName}'s** ${title} attempts to hit with a **${rollValue}**.`;
        break;
      case 'Damage':
        return `**${characterName}'s** ${title} caused **${rollValue}** damage.`;
        break;
      case 'Free':
        return `**${characterName}** rolls ${match[2]} with a ${match[4]}`
        break;
      default:
        return `**${characterName}** rolls ${title} for **${match[1]}**.`;
        break;
    }
  }

  return `${stripHTML(history)}`;
}

async function sendToDiscord(message) {
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

    const result = await getStorageData(["webhooks", "activeWebhook"]);
    const webhooks = result.webhooks || [];
    const activeWebhookName = result.activeWebhook;
    const webhook = webhooks.find((w) => w.name === activeWebhookName);

    console.log("Webhooks:", webhooks);
    console.log("Active Webhook Name:", activeWebhookName);
    console.log("Found Webhook:", webhook);

    if (!webhook) {
      console.error("Active webhook not found");
      throw new Error("Active webhook not found");
    }

    console.log("Sending message to webhook:", webhook.url);
    const response = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        avatar_url: "https://i.imgur.com/xi6Qssm.png",
        content: message,
      }),
    });

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
        messageSize: new TextEncoder().encode(message).length,
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
      messagePreview: message ? message.substring(0, 100) + "..." : 'N/A',
      webhookUrl: webhook?.url ? webhook.url.substring(0, webhook.url.indexOf('?')) + '...' : 'N/A'
    });
    return `Error: ${error.message}`;
  }
}

async function handleSendToDiscord(request, sendResponse) {
  try {
    const result = await sendToDiscord(request.message);
    console.log("Send to Discord result:", result);
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

async function handleLogDiceHistory(request, sendResponse) {
  characterName = request.data;
  const formattedMessage = parseDiceHistory(request.data, request.title);
  try {
    const result = await sendToDiscord(formattedMessage);
    sendResponse({ status: result === "Message sent" ? "ok" : "error" });
  } catch (error) {
    sendResponse({ status: "error", message: error.message });
  }
}

async function handleLogCharacterName(request, sendResponse) {
  characterName = request.data;
  const formattedMessage = parseDiceHistory(request.history, request.title);
  try {
    const result = await sendToDiscord(formattedMessage);
    sendResponse({ status: result === "Message sent" ? "ok" : "error" });
  } catch (error) {
    sendResponse({ status: "error", message: error.message });
  }
}

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "logDiceHistory":
      handleLogDiceHistory(request, sendResponse);
      break;
    case "logCharacterName":
      handleLogCharacterName(request, sendResponse);
      break;
    case "sendToDiscord":
      handleSendToDiscord(request, sendResponse);
      break;
    default:
      console.error("Unknown action:", request.action);
      break;
  }
  return true; // Keep the message channel open for async response
});
