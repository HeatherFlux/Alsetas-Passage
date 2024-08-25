// Utility functions
async function getStorageData(keys) {
  try {
    return await chrome.storage.sync.get(keys);
  } catch (error) {
    console.error("Error getting storage data:", error);
    throw error;
  }
}

function stripHTML(html) {
  return html.replace(/<\/?[^>]+(>|$)/g, " ");
}

function removePrefix(history) {
  return history.replace(/\d{1,2}:\d{2}:\d{2} (AM|PM) Your /, ``);
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

async function handleSendToDiscord(request, sendResponse) {
  try {
    const result = await sendToDiscord(request.message);
    console.log(result);
    sendResponse({ status: result === "Message sent" ? "ok" : "error" });
  } catch (error) {
    sendResponse({ status: "error", message: error.message });
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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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
