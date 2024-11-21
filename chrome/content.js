// content.js

const browser = chrome;

// Enhanced Console Logging
const originalConsoleLog = console.log;
console.log = function (...args) {
  originalConsoleLog('Alseta\'s Passage Log:', ...args);
};

// Inject CSS and JS for Toast Notifications
function injectToastAssets() {
  const css = document.createElement("link");
  css.href = browser.runtime.getURL("toast.css");
  css.rel = "stylesheet";
  document.head.appendChild(css);

  const script = document.createElement("script");
  script.src = browser.runtime.getURL("toast.js");
  document.head.appendChild(script);
}

// Show Toast Notification
function showToast(message, duration = 3000) {
  let toastContainer = document.getElementById("alseta-toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "alseta-toast-container";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.className = "alseta-toast";
  toast.textContent = message;

  const closeButton = document.createElement("span");
  closeButton.className = "close-btn";
  closeButton.textContent = "×";
  closeButton.addEventListener("click", () => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 500);
  });

  toast.appendChild(closeButton);
  toastContainer.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 500);
  }, duration);
}

// Utility Functions
const utils = {
  formatListViewDetails(details) {
    return details.replace(/\n+/g, "\n> ").trim();
  },
  convertHtmlToMarkdown(htmlContent) {
    let markdown = htmlContent;
    markdown = markdown.replace(/<b>(.*?)<\/b>/g, "**$1**")
      .replace(/<i>(.*?)<\/i>/g, "*$1*")
      .replace(/<br\s*\/?>/g, "\n")
      .replace(/<[^>]+>/g, "\n");
    return markdown.trim();
  },
  sanitizeHTML(str) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = str;

    // Remove script elements
    const scripts = tempDiv.getElementsByTagName('script');
    while (scripts.length > 0) {
      scripts[0].parentNode.removeChild(scripts[0]);
    }

    // Remove event attributes
    const elements = tempDiv.getElementsByTagName('*');
    Array.from(elements).forEach(element => {
      Array.from(element.attributes).forEach(attr => {
        if (attr.name.startsWith('on')) {
          element.removeAttribute(attr.name);
        }
      });
    });

    return tempDiv.innerHTML;
  }
};

// Create Export Button
function createExportButton() {
  const button = document.createElement("button");
  button.textContent = "Send To Discord";
  button.className = "discord-export-button";
  Object.assign(button.style, {
    fontSize: "12px",
    marginBottom: "10px",
    padding: "2px 5px",
    display: "inline-block",
    verticalAlign: "middle",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    width: "auto"
  });
  return button;
}

// Extract and Format Traits
function extractAndFormatTraits(detailDiv) {
  const traitDivs = detailDiv.querySelectorAll(".trait");
  const traits = Array.from(new Set(Array.from(traitDivs).map(trait => `**${trait.innerText}**`))).join(" ");
  return { traits, traitDivs };
}

// Remove Elements from HTML Content
function removeElementsFromHtml(contentHtml, elements) {
  elements.forEach(element => {
    contentHtml = contentHtml.replace(element.outerHTML, "");
  });
  return contentHtml;
}

// Prepare Message for Discord
function prepareMessage(title, traits, contentMarkdown) {
  const formattedDetails = utils.formatListViewDetails(contentMarkdown);
  return traits
    ? `**${title}**\n> **Traits:** ${traits}\n> ${formattedDetails}`
    : `**${title}**\n> ${formattedDetails}`;
}

// Handle Button Click Event
function handleButtonClick(event, div) {
  event.stopPropagation();

  let detailDiv = div.querySelector(".listview-detail") || div.querySelector(".listview-detail + *");
  if (!detailDiv) {
    console.error("No detailDiv found for", div);
    return;
  }

  const title = div.querySelector(".listview-title")?.innerText || "";
  const { traits, traitDivs } = extractAndFormatTraits(detailDiv);

  let contentHtml = detailDiv.innerHTML;
  contentHtml = removeElementsFromHtml(contentHtml, traitDivs);

  const button = div.querySelector(".discord-export-button");
  if (button) {
    contentHtml = removeElementsFromHtml(contentHtml, [button]);
  }

  const contentMarkdown = utils.convertHtmlToMarkdown(contentHtml);
  const message = prepareMessage(title, traits, contentMarkdown);

  console.log(`Preparing to send message to Discord: ${message}`);

  browser.runtime.sendMessage({
    action: "sendToDiscord",
    message: message,
  })
    .then(response => {
      if (response?.status === "ok") {
        console.log("Message successfully sent to background script");
      } else {
        showToast("Error sending to Discord");
        console.error("Failed to send message to background script");
      }
    })
    .catch(error => {
      showToast("Error sending to Discord");
      console.error("Error sending message to background script:", error);
    });
}

// Event Listener Registry to Prevent Multiple Listeners
const eventListenerRegistry = new WeakMap();

// Check if Element Has Event Listener
function hasEventListener(element, eventName) {
  return eventListenerRegistry.has(element) && eventListenerRegistry.get(element).includes(eventName);
}

// Add Detail Export Button to a Div
function addDetailExportButton(div) {
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
    button.addEventListener("click", event => handleButtonClick(event, div));

    if (!eventListenerRegistry.has(button)) {
      eventListenerRegistry.set(button, []);
    }
    eventListenerRegistry.get(button).push("click");
  }
}

// Handle Dynamically Loaded Content
function handleDynamicContent() {
  const containers = document.querySelectorAll(".listview-item, .div-info-lm-box");
  containers.forEach(div => addDetailExportButton(div));

  containers.forEach(div => {
    div.addEventListener("click", () => {
      setTimeout(() => {
        let hiddenDetailDiv = div.querySelector(".listview-detail.hidden") || div.querySelector(".listview-detail.hidden + *");
        if (hiddenDetailDiv) {
          hiddenDetailDiv.classList.remove("hidden");
          addDetailExportButton(div);
        }
      }, 500);
    });
  });
}

// Observe Added Nodes in the Document
const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (node.nodeType === 1) { // Element Node
        if (node.matches(".listview-item, .div-info-lm-box")) {
          addDetailExportButton(node);
          node.addEventListener("click", () => {
            setTimeout(() => {
              let detailDiv = node.querySelector(".listview-detail") || node.querySelector(".listview-detail + *");
              if (detailDiv && !detailDiv.classList.contains("hidden")) {
                // Optionally, handle detailDiv updates here
              }
            }, 500);
          });
        } else {
          // Check for any child .listview-item elements
          node.querySelectorAll(".listview-item, .div-info-lm-box").forEach(child => {
            addDetailExportButton(child);
            child.addEventListener("click", () => {
              setTimeout(() => {
                let detailDiv = child.querySelector(".listview-detail") || child.querySelector(".listview-detail + *");
                if (detailDiv && !detailDiv.classList.contains("hidden")) {
                  // Optionally, handle detailDiv updates here
                }
              }, 500);
            });
          });
        }
      }
    });
  });
});

// Start Observing the Document Body
observer.observe(document.body, { childList: true, subtree: true });

// Initial Setup on DOM Content Loaded
document.addEventListener("DOMContentLoaded", () => {
  injectToastAssets();
  handleDynamicContent();
});

// Character Data Management
let characterName = "";
let diceTitle = "";

// Function to Check if Current Page is Beta
function isBetaPage() {
  return window.location.href.includes("/beta/");
}

// Fetch Character Name
function fetchCharacterName() {
  const characterNameDiv = Array.from(document.querySelectorAll(".small-text.grey-text.button-text"))
    .find(div => div.textContent.trim() === "Character Name");
  const nextSiblingDiv = characterNameDiv?.nextElementSibling;
  const name = nextSiblingDiv && nextSiblingDiv.classList.contains("button-selection")
    ? nextSiblingDiv.textContent.trim()
    : "";
  console.log(`Fetched Character Name: ${name}`);
  return name;
}

// Fetch Dice Title
function fetchDiceTitle() {
  const diceTitleDiv = document.getElementById("dice-title");
  const title = diceTitleDiv ? diceTitleDiv.textContent.trim() : "";
  console.log(`Fetched Dice Title: ${title}`);
  return title;
}

// Log Dice History
function logDiceHistory() {
  try {
    const diceHistoryDiv = document.getElementById("dice-history");
    if (!diceHistoryDiv) {
      console.log("Dice history div not found");
      return;
    }

    const latestHistory = diceHistoryDiv.firstElementChild;
    if (!latestHistory) {
      throw new Error('No History Found');
    }

    const diceTitle = fetchDiceTitle();
    if (isBetaPage()) {
      browser.runtime.sendMessage({
        action: "logCharacterName",
        data: characterName,
        history: latestHistory.innerHTML,
        title: diceTitle,
      });
    } else {
      const fetchedCharacterName = fetchCharacterName();
      if (fetchedCharacterName) {
        characterName = fetchedCharacterName; // Update global characterName
        console.log(`Updated Global Character Name: ${characterName}`);
        browser.runtime.sendMessage({
          action: "logCharacterName",
          data: characterName,
          history: latestHistory.innerHTML,
          title: diceTitle,
        });
      } else {
        console.error("Character name not found on main page");
        browser.runtime.sendMessage({
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

// Extract Character Data from HTML Content
function extractCharacterData(htmlContent) {
  const sanitizedContent = utils.sanitizeHTML(htmlContent);
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = sanitizedContent;

  const safeExtract = (selector, index = 0, defaultValue = "") => {
    const elements = tempDiv.querySelectorAll(selector);
    return elements.length > index ? elements[index].innerText.trim() : defaultValue;
  };

  // Extract Various Character Attributes
  const characterData = {
    name: safeExtract('.subtitle', 0),
    level: safeExtract('.item-level-box', 0),
    recallKnowledge: tempDiv.querySelectorAll('b')[0]?.nextSibling?.nodeValue?.trim() || "",
    unspecificLore: tempDiv.querySelectorAll('b')[1]?.nextSibling?.nodeValue?.trim() || "",
    specificLore: tempDiv.querySelectorAll('b')[2]?.nextSibling?.nodeValue?.trim() || "",
    traits: Array.from(tempDiv.querySelectorAll('.trait')).map(trait => trait.innerText.trim()),
    skills: Array.from(tempDiv.querySelectorAll('.button-mystery')).map(skill => {
      const skillName = skill.querySelector('b')?.innerText || '';
      const skillValue = skill.querySelector('span')?.innerText || '';
      return `${skillName} ${skillValue}`.trim();
    }),
    abilities: tempDiv.innerText.match(/Str\s[+-]\d,\sDex\s[+-]\d,\sCon\s[+-]\d,\sInt\s[+-]\d,\sWis\s[+-]\d,\sCha\s[+-]\d/)?.[0] || "",
    items: Array.from(tempDiv.querySelectorAll('b')).find(b => b.innerText === "Items")?.nextSibling?.nodeValue.trim() || "",
    ac: Array.from(tempDiv.querySelectorAll('b')).find(b => b.innerText === "AC")?.nextElementSibling?.innerText.trim() || "",
    fort: Array.from(tempDiv.querySelectorAll('.button-mystery')).find(b => b.innerText.includes("Fort"))?.querySelector('span')?.innerText.trim() || "",
    ref: Array.from(tempDiv.querySelectorAll('.button-mystery')).find(b => b.innerText.includes("Ref"))?.querySelector('span')?.innerText.trim() || "",
    will: Array.from(tempDiv.querySelectorAll('.button-mystery')).find(b => b.innerText.includes("Will"))?.querySelector('span')?.innerText.trim() || "",
    hp: Array.from(tempDiv.querySelectorAll('b')).find(b => b.innerText === "HP")?.nextElementSibling?.innerText.trim() || "",
    speed: Array.from(tempDiv.querySelectorAll('b')).find(b => b.innerText === "Speed")?.nextSibling?.nodeValue.trim() || "",
    melee: Array.from(tempDiv.querySelectorAll('b')).find(b => b.innerText === "Melee")?.parentNode?.innerText.replace("Melee", "").trim() || "",
    ranged: Array.from(tempDiv.querySelectorAll('b')).find(b => b.innerText === "Ranged")?.parentNode?.innerText.replace("Ranged", "").trim() || "",
    spells: Array.from(tempDiv.querySelectorAll('b')).find(b => b.innerText.includes("Spells"))?.parentNode?.innerText.replace(Array.from(tempDiv.querySelectorAll('b')).find(b => b.innerText.includes("Spells")).innerText, "").trim() || "",
  };

  console.log("Extracted Character Data:", characterData);
  return characterData;
}

// Observe Statblock for Changes
function observeStatblock() {
  const statblock = document.querySelector(".div-statblock");
  if (!statblock) return;

  const observer = new MutationObserver(mutationsList => {
    for (let mutation of mutationsList) {
      if (mutation.type === 'childList' || mutation.type === 'subtree') {
        if (isBetaPage()) {
          const htmlContent = statblock.innerHTML;
          const stats = extractCharacterData(htmlContent);
          characterName = stats.name;
          diceTitle = fetchDiceTitle();
          console.log(`Updated Character Name: ${characterName}`);
          console.log(`Updated Dice Title: ${diceTitle}`);
          browser.runtime.sendMessage({
            action: "logCharacterName",
            data: characterName,
            history: stats,
            title: diceTitle,
          });
        }
      }
    }
  });

  observer.observe(statblock, { childList: true, subtree: true });
}

// Observe Page for Statblock
function observePageForStatblock() {
  const observer = new MutationObserver(() => {
    const statblock = document.querySelector(".div-statblock");
    if (statblock) {
      observeStatblock();
      observer.disconnect();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// Observe Dice History Div for Changes
function observeDiceHistory() {
  const diceHistoryDiv = document.getElementById("dice-history");
  if (!diceHistoryDiv) {
    console.log("Dice history div not found");
    return;
  }

  const observer = new MutationObserver(() => {
    logDiceHistory();
  });

  observer.observe(diceHistoryDiv, { childList: true });
}

// Observe Sidebar for Title and Character Name Updates
function observeSidebar() {
  const sidebar = document.querySelector(".dice-tray");
  if (!sidebar) {
    console.log("Sidebar not found");
    return;
  }

  const observer = new MutationObserver(() => {
    diceTitle = fetchDiceTitle();
    const fetchedCharacterName = fetchCharacterName();
    if (fetchedCharacterName) {
      characterName = fetchedCharacterName;
      console.log(`Updated Global Character Name: ${characterName}`);
    }
    console.log(`Dice title updated: ${diceTitle}`);
  });

  observer.observe(sidebar, { childList: true, subtree: true });
}

// Initialize the Script
function init() {
  observeDiceHistory();
  observeSidebar();
  observePageForStatblock();
}

// Run Initialization on Window Load
window.addEventListener("load", init);
